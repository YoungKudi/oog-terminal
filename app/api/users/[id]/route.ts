import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserIdFromSession } from '@/lib/auth-helpers'
import bcrypt from 'bcryptjs'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'officer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { role, resetPassword } = await req.json()
  const updates: any = {}
  
  if (role) updates.role = role
  if (resetPassword) {
    updates.password = await bcrypt.hash('password123', 10)
  }
  
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates' }, { status: 400 })
  }
  
  updates.updatedAt = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('User')
    .update(updates)
    .eq('id', params.id)
    .select('id, name, email, userId, phone, role')
    .single()
  
  if (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'officer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  if (params.id === session.user.id) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
  }
  
  const { error } = await supabase
    .from('User')
    .delete()
    .eq('id', params.id)
  
  if (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
  
  return NextResponse.json({ success: true })
}
