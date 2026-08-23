import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserIdFromSession } from '@/lib/auth-helpers'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const body = await req.json()
  const { position, size, type, equipment, auxCargo, remarks } = body
  
  const { data, error } = await supabase
    .from('Container')
    .update({
      position,
      size,
      type,
      equipment,
      auxCargo: auxCargo || '',
      remarks: remarks || ''
    })
    .eq('id', params.id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating container:', error)
    return NextResponse.json({ error: 'Failed to update container' }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const userId = await getUserIdFromSession(session)
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 400 })
  }
  
  const { data: container, error: fetchError } = await supabase
    .from('Container')
    .select('containerNumber')
    .eq('id', params.id)
    .single()
  
  if (fetchError) {
    return NextResponse.json({ error: 'Container not found' }, { status: 404 })
  }
  
  const { error } = await supabase
    .from('Container')
    .delete()
    .eq('id', params.id)
  
  if (error) {
    console.error('Error deleting container:', error)
    return NextResponse.json({ error: 'Failed to delete container' }, { status: 500 })
  }
  
  await supabase
    .from('ActivityLog')
    .insert({
      action: 'DELETED_CONTAINER',
      containerNumber: container.containerNumber,
      details: 'Container deleted',
      userId: userId
    })
  
  return NextResponse.json({ success: true })
}
