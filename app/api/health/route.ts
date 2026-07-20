import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'unknown',
      auth: 'unknown',
    }
  }

  // Check database
  try {
    await query('SELECT 1')
    health.services.database = 'healthy'
  } catch (error) {
    health.services.database = 'unhealthy'
    health.status = 'unhealthy'
  }

  // Check auth
  try {
    await getServerSession(authOptions)
    health.services.auth = 'healthy'
  } catch (error) {
    health.services.auth = 'unhealthy'
    health.status = 'unhealthy'
  }

  const statusCode = health.status === 'healthy' ? 200 : 503
  return NextResponse.json(health, { status: statusCode })
}
