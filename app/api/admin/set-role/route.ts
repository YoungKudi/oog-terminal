import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ONLY admin can change roles
  if (session.user?.role !== 'admin') {
    return NextResponse.json({ 
      error: 'Only Admin can change roles' 
    }, { status: 403 })
  }

  try {
    const { userId, newRole } = await req.json()

    if (!userId || !newRole) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (!['user', 'officer', 'admin'].includes(newRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('userId, name, email, role')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent admin from demoting themselves
    if (user.userId === session.user.userId && newRole !== 'admin') {
      return NextResponse.json({ 
        error: 'Cannot change your own role' 
      }, { status: 400 })
    }

    // Update role
    const { error: updateError } = await supabase
      .from('User')
      .update({ 
        role: newRole,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating role:', updateError)
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
    }

    // Log activity
    await supabase
      .from('ActivityLog')
      .insert({
        action: 'ROLE_CHANGED',
        details: `Changed ${user.userId} role from ${user.role} to ${newRole}`,
        userId: session.user.id
      })

    return NextResponse.json({ 
      success: true, 
      message: `${user.name || user.userId} is now ${newRole}` 
    })
  } catch (error: any) {
    console.error('Error in set-role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
