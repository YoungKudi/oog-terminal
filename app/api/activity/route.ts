import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const url = new URL(req.url)
  const search = url.searchParams.get('search') || ''
  const limit = parseInt(url.searchParams.get('limit') || '100')
  
  let query = supabase
    .from('ActivityLog')
    .select('*, User!inner(name, email, userId)')
    .order('createdAt', { ascending: false })
    .limit(limit)
  
  if (search) {
    query = query.or(`containerNumber.ilike.%${search}%,details.ilike.%${search}%`)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }
  
  return NextResponse.json(data || [])
}
