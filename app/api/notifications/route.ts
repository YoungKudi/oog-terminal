import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const since = url.searchParams.get('since') || ''
  const limit = parseInt(url.searchParams.get('limit') || '50')

  let query = supabase
    .from('ActivityLog')
    .select('id, action, containerNumber, details, createdAt, userId, User:User(name, userId)')
    .order('createdAt', { ascending: false })
    .limit(limit)

  // Only fetch newer than "since" timestamp if provided
  if (since) {
    query = query.gt('createdAt', since)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }

  // Transform ActivityLog entries into notification-friendly format
  const notifications = (data || []).map((log: any) => {
    // Build a friendly title from the action
    const title = formatActionTitle(log.action)
    const message = formatActionMessage(log)

    return {
      id: log.id,
      action: log.action,
      title,
      message,
      containerNumber: log.containerNumber || null,
      createdAt: log.createdAt,
      userId: log.userId,
      userName: log.User?.name || log.User?.userId || 'Someone',
      details: log.details || null
    }
  })

  return NextResponse.json(notifications)
}

function formatActionTitle(action: string): string {
  const titles: Record<string, string> = {
    'CONTAINER_ADDED': '📦 New Container Added',
    'CONTAINER_UPDATED': '✏️ Container Updated',
    'CONTAINER_DELETED': '🗑️ Container Removed',
    'DEVANNING_STARTED': '🏗️ Devanning Started',
    'UNSTUFFED': '✅ Container Unstuffed',
    'CLEARED': '📋 Container Cleared',
    'EVACUATED': '🚚 Container Evacuated',
    'EVACUATION_RETURNED': '↩️ Returned from Evacuation',
    'CLEARED_STACK': '🗑️ Stack Cleared',
    'CLEARED_RECEIVALS': '🗑️ Old Receivals Cleared',
    'LOGIN_SUCCESS': '🔐 User Logged In',
    'LOGIN_FAILED': '❌ Login Failed',
    'USER_CREATED': '👤 New User Registered',
    'ROLE_CHANGED': '👑 Role Changed',
    'EMAIL_SENT': '📧 Email Sent',
    'EMAIL_SIMULATED': '📧 Email (simulated)'
  }
  return titles[action] || `📢 ${action.replace(/_/g, ' ')}`
}

function formatActionMessage(log: any): string {
  const container = log.containerNumber ? ` ${log.containerNumber}` : ''
  const details = log.details || ''
  
  switch (log.action) {
    case 'CONTAINER_ADDED':
      return `Container${container} was added to the stack`
    case 'CONTAINER_UPDATED':
      return `Container${container} was updated`
    case 'CONTAINER_DELETED':
      return `Container${container} was removed`
    case 'DEVANNING_STARTED':
      return `Container${container} moved to devanning`
    case 'UNSTUFFED':
      return `Container${container} has been unstuffed`
    case 'CLEARED':
      return `Container${container} was cleared`
    case 'EVACUATED':
      return `Container${container} was evacuated`
    default:
      return details || `Action: ${log.action}`
  }
}
