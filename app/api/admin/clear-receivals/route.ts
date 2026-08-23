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
  
  const url = new URL(req.url)
  const days = parseInt(url.searchParams.get('days') || '4')
  
  const thresholdDate = new Date()
  thresholdDate.setDate(thresholdDate.getDate() - days)
  const thresholdStr = thresholdDate.toISOString().split('T')[0]
  
  // Get containers to delete
  const { data: containers, error: fetchError } = await supabase
    .from('Container')
    .select('containerNumber')
    .lt('receivedDate', thresholdStr)
  
  if (fetchError) {
    console.error('Error fetching old containers:', fetchError)
    return NextResponse.json({ error: 'Failed to fetch old containers' }, { status: 500 })
  }
  
  const deletedContainers = containers.map(c => c.containerNumber)
  
  // Delete old containers
  const { error } = await supabase
    .from('Container')
    .delete()
    .lt('receivedDate', thresholdStr)
  
  if (error) {
    console.error('Error clearing receivals:', error)
    return NextResponse.json({ error: 'Failed to clear receivals' }, { status: 500 })
  }
  
  await supabase
    .from('ActivityLog')
    .insert({
      action: 'CLEARED_RECEIVALS',
      details: `Cleared ${deletedContainers.length} containers older than ${days} days: ${deletedContainers.join(', ') || 'none'}`,
      userId: userId
    })
  
  return NextResponse.json({
    success: true,
    deleted: deletedContainers.length,
    message: `Cleared ${deletedContainers.length} containers older than ${days} days`,
    containers: deletedContainers
  })
}
