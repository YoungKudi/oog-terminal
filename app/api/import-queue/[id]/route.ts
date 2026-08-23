import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserIdFromSession } from '@/lib/auth-helpers'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { action } = await req.json()
  const userId = await getUserIdFromSession(session)
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 400 })
  }
  
  const { data: item, error: fetchError } = await supabase
    .from('ImportQueue')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (fetchError || !item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  
  if (action === 'accept') {
    // Move to Container
    const { error: insertError } = await supabase
      .from('Container')
      .insert({
        containerNumber: item.containerNumber,
        position: item.position,
        size: item.size,
        type: item.type,
        equipment: item.equipment,
        auxCargo: item.auxCargo || '',
        remarks: item.remarks || '',
        receivedDate: item.receivedDate || new Date().toISOString().split('T')[0],
        userId: userId
      })
    
    if (insertError) {
      console.error('Error accepting from queue:', insertError)
      return NextResponse.json({ error: 'Failed to accept' }, { status: 500 })
    }
    
    // Delete from ImportQueue
    await supabase
      .from('ImportQueue')
      .delete()
      .eq('id', params.id)
    
    await supabase
      .from('ActivityLog')
      .insert({
        action: 'ACCEPTED_QUEUE',
        containerNumber: item.containerNumber,
        details: 'Accepted from queue',
        userId: userId
      })
    
    return NextResponse.json({ success: true })
  } else {
    // Reject - just delete
    await supabase
      .from('ImportQueue')
      .delete()
      .eq('id', params.id)
    
    return NextResponse.json({ success: true })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  await supabase
    .from('ImportQueue')
    .delete()
    .eq('id', params.id)
  
  return NextResponse.json({ success: true })
}
