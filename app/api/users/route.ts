import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserIdFromSession } from '@/lib/auth-helpers'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user?.role !== 'officer') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }
  
  const { data, error } = await supabase
    .from('User')
    .select('id, name, email, userId, phone, role, "createdAt"')
    .order('name')
  
  if (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
  
  return NextResponse.json(data || [])
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'officer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { name, email, userId, phone, role = 'user' } = await req.json()
  if (!name || !email || !userId || !phone) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  
  const defaultPassword = await bcrypt.hash('password123', 10)
  
  const { data, error } = await supabase
    .from('User')
    .insert({
      name,
      email: email.toLowerCase().trim(),
      userId: userId.toUpperCase().trim(),
      phone,
      password: defaultPassword,
      role
    })
    .select('id, name, email, userId, phone, role')
    .single()
  
  if (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
  
  return NextResponse.json(data, { status: 201 })
}
