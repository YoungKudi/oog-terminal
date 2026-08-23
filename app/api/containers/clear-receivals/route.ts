import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { query } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  if (session.user?.role !== 'officer') {
    return NextResponse.json({ error: 'Access denied. Officers only.' }, { status: 403 })
  }

  try {
    const userResult = await query('SELECT id FROM "User" WHERE "userId" = $1', [session.user.userId])
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 400 })
    }
    const userId = userResult.rows[0].id
    
    const url = new URL(req.url)
    const days = parseInt(url.searchParams.get('days') || '4')
    
    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() - days)
    
    const result = await query(
      'DELETE FROM "Container" WHERE "receivedDate" < $1 RETURNING "containerNumber"',
      [thresholdDate.toISOString().split('T')[0]]
    )
    
    const deletedCount = result.rows.length
    const deletedContainers = result.rows.map(r => r.containerNumber).join(', ')
    
    await query(
      'INSERT INTO "ActivityLog" (action, details, "userId") VALUES ($1, $2, $3)',
      ['CLEARED_RECEIVALS', `Cleared ${deletedCount} containers older than ${days} days: ${deletedContainers || 'none'}`, userId]
    )
    
    return NextResponse.json({ 
      success: true, 
      deleted: deletedCount,
      message: `Cleared ${deletedCount} containers older than ${days} days`,
      containers: deletedContainers ? deletedContainers.split(', ') : []
    })
  } catch (error) {
    console.error('Error clearing receivals:', error)
    return NextResponse.json({ error: 'Failed to clear receivals' }, { status: 500 })
  }
}
