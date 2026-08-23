import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserIdFromSession } from '@/lib/auth-helpers'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { data, error } = await supabase
    .from('ImportQueue')
    .select('*')
    .order('createdAt', { ascending: false })
  
  if (error) {
    console.error('Error fetching import queue:', error)
    return NextResponse.json({ error: 'Failed to fetch import queue' }, { status: 500 })
  }
  
  return NextResponse.json(data || [])
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const body = await req.json()
  const userId = await getUserIdFromSession(session)
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 400 })
  }
  
  const { data, error } = await supabase
    .from('ImportQueue')
    .insert({
      containerNumber: body.containerNumber.toUpperCase().trim(),
      position: body.position,
      size: body.size,
      type: body.type,
      equipment: body.equipment,
      auxCargo: body.auxCargo || '',
      remarks: body.remarks || '',
      userId: userId
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error adding to import queue:', error)
    return NextResponse.json({ error: 'Failed to add to import queue' }, { status: 500 })
  }
  
  return NextResponse.json(data, { status: 201 })
}
