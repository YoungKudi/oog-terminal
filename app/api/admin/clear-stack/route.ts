import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserIdFromSession } from '@/lib/auth-helpers'

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  if (session.user?.role !== 'officer') {
    return NextResponse.json({ error: 'Access denied. Officers only.' }, { status: 403 })
  }
  
  const userId = await getUserIdFromSession(session)
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 400 })
  }
  
  // Get count before deletion
  const { count, error: countError } = await supabase
    .from('Container')
    .select('*', { count: 'exact', head: true })
  
  if (countError) {
    console.error('Error counting containers:', countError)
    return NextResponse.json({ error: 'Failed to count containers' }, { status: 500 })
  }
  
  if (count === 0) {
    return NextResponse.json({ success: true, deleted: 0, message: 'Stack is already empty' })
  }
  
  // Get container numbers for logging
  const { data: containers, error: fetchError } = await supabase
    .from('Container')
    .select('containerNumber')
  
  if (fetchError) {
    console.error('Error fetching containers:', fetchError)
    return NextResponse.json({ error: 'Failed to fetch containers' }, { status: 500 })
  }
  
  const deletedContainers = containers.map(c => c.containerNumber)
  
  // Delete all containers
  const { error } = await supabase
    .from('Container')
    .delete()
    .neq('id', '') // Delete all
  
  if (error) {
    console.error('Error clearing stack:', error)
    return NextResponse.json({ error: 'Failed to clear stack' }, { status: 500 })
  }
  
  await supabase
    .from('ActivityLog')
    .insert({
      action: 'CLEARED_STACK',
      details: `Cleared entire stack: ${deletedContainers.length} containers removed: ${deletedContainers.join(', ') || 'none'}`,
      userId: userId
    })
  
  return NextResponse.json({
    success: true,
    deleted: deletedContainers.length,
    message: `Cleared entire stack: ${deletedContainers.length} containers removed`,
    containers: deletedContainers
  })
}
