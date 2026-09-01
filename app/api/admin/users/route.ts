import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'officer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('User')
      .select('id, name, email, userId, phone, role, approved, createdAt, rejectionReason')
      .order('createdAt', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'officer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { userId, action, reason } = body

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (action === 'approve') {
      const { error } = await supabase
        .from('User')
        .update({
          approved: true,
          approvedAt: new Date().toISOString(),
          approvedBy: session.user.id,
          rejectionReason: null
        })
        .eq('id', userId)

      if (error) {
        return NextResponse.json({ error: 'Failed to approve user' }, { status: 500 })
      }

      return NextResponse.json({ success: true, action: 'approved' })
    }

    if (action === 'deny') {
      const { error } = await supabase
        .from('User')
        .update({
          approved: false,
          rejectionReason: reason || 'No reason provided',
          approvedBy: session.user.id
        })
        .eq('id', userId)

      if (error) {
        return NextResponse.json({ error: 'Failed to deny user' }, { status: 500 })
      }

      return NextResponse.json({ success: true, action: 'denied' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
