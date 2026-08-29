import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserIdFromSession } from '@/lib/auth-helpers'

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { containerNumber } = await req.json()
  if (!containerNumber) {
    return NextResponse.json({ error: 'Container number required' }, { status: 400 })
  }
  
  const userId = await getUserIdFromSession(session)
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 400 })
  }
  
  // Delete from UnstuffedContainer
  const { error } = await supabase
    .from('UnstuffedContainer')
    .delete()
    .eq('containerNumber', containerNumber)
  
  if (error) {
    console.error('Error deleting unstuffed container:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
  
  // Log activity
  await supabase
    .from('ActivityLog')
    .insert({
      action: 'CLEARED_FROM_UNSTUFFED',
      containerNumber: containerNumber,
      details: 'Container cleared from unstuffed list',
      userId: userId
    })
  
  return NextResponse.json({ success: true })
}
