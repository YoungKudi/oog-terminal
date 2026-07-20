import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { data, error } = await supabase
    .from('UnstuffedContainer')
    .select('*')
    .order('unstuffedAt', { ascending: false })
  
  if (error) {
    console.error('Error fetching unstuffed:', error)
    return NextResponse.json({ error: 'Failed to fetch unstuffed' }, { status: 500 })
  }
  
  return NextResponse.json(data || [])
}
