import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserIdFromSession } from '@/lib/auth-helpers'
import bcrypt from 'bcryptjs'

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { name, phone, currentPassword, newPassword } = await req.json()
  
  const userId = await getUserIdFromSession(session)
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 400 })
  }
  
  // Get current user
  const { data: user, error: fetchError } = await supabase
    .from('User')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (fetchError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  
  const updates: any = {}
  if (name && name !== user.name) updates.name = name
  if (phone && phone !== user.phone) updates.phone = phone
  
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password required' }, { status: 400 })
    }
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Current password incorrect' }, { status: 400 })
    }
    updates.password = await bcrypt.hash(newPassword, 10)
  }
  
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No changes' }, { status: 400 })
  }
  
  updates.updatedAt = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('User')
    .update(updates)
    .eq('id', userId)
    .select('id, name, email, userId, phone, role')
    .single()
  
  if (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
