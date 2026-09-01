import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log('🔍 Admin GET - Session:', session?.user?.userId, 'Role:', session?.user?.role)
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    if (session.user?.role !== 'officer') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('User')
      .select('id, name, email, userId, phone, role, approved, createdAt, rejectionReason')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('❌ Error in GET /api/admin/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log('🔍 Admin POST - Session:', session?.user?.userId)
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    if (session.user?.role !== 'officer') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const body = await req.json()
    console.log('📝 POST body:', body)
    
    const { userId, action, reason } = body

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (action === 'approve') {
      console.log('✅ Approving user:', userId)
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
        console.error('❌ Update error:', error)
        return NextResponse.json({ error: 'Failed to approve user' }, { status: 500 })
      }

      return NextResponse.json({ success: true, action: 'approved' })
    }

    if (action === 'deny') {
      console.log('❌ Denying user:', userId, 'Reason:', reason)
      const { error } = await supabase
        .from('User')
        .update({
          approved: false,
          rejectionReason: reason || 'No reason provided',
          approvedBy: session.user.id
        })
        .eq('id', userId)

      if (error) {
        console.error('❌ Update error:', error)
        return NextResponse.json({ error: 'Failed to deny user' }, { status: 500 })
      }

      return NextResponse.json({ success: true, action: 'denied' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('❌ Error in POST /api/admin/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
