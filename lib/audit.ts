import { getSupabase } from './db'

export type AuditAction = 
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'USER_CREATED'
  | 'CONTAINER_ADDED'
  | 'CONTAINER_UPDATED'
  | 'CONTAINER_DELETED'
  | 'PUBLIC_SEARCH'

export interface AuditLogEntry {
  action: AuditAction
  userId?: string
  ipAddress?: string
  userAgent?: string
  details?: Record<string, any>
  containerNumber?: string
}

export async function logAudit(entry: AuditLogEntry) {
  const supabase = getSupabase()
  if (!supabase) return

  try {
    const { error } = await supabase
      .from('ActivityLog')
      .insert({
        action: entry.action,
        userId: entry.userId || null,
        details: entry.details ? JSON.stringify(entry.details) : null,
        containerNumber: entry.containerNumber || null,
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
        createdAt: new Date().toISOString()
      })
    
    if (error) {
      console.error('Failed to log audit:', error)
    }
  } catch (error) {
    console.error('Audit log error:', error)
  }
}

export function getClientInfo(req: Request) {
  return {
    ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown'
  }
}
