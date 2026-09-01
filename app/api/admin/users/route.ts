import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { sendEmail, getEmailTemplate, renderTemplate } from '@/lib/email'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'officer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('User')
      .select('id, name, email, userId, phone, role, approved, createdAt, approvedAt, rejectionReason')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error)
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

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (action === 'approve') {
      // Approve the user
      const { error: updateError } = await supabase
        .from('User')
        .update({
          approved: true,
          approvedAt: new Date().toISOString(),
          approvedBy: session.user.id,
          rejectionReason: null
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Error approving user:', updateError)
        return NextResponse.json({ error: 'Failed to approve user' }, { status: 500 })
      }

      // Send approval email
      try {
        const template = await getEmailTemplate('approved')
        if (template) {
          const loginUrl = process.env.NEXTAUTH_URL || 'https://oog-terminal.vercel.app'
          const html = renderTemplate(template.html, {
            name: user.name || user.userId,
            userId: user.userId,
            loginUrl: loginUrl
          })
          await sendEmail({
            to: user.email,
            subject: template.subject,
            html: html
          })
        }
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError)
      }

      return NextResponse.json({ success: true, action: 'approved' })
    } 
    
    if (action === 'deny') {
      // Deny the user
      const { error: updateError } = await supabase
        .from('User')
        .update({
          approved: false,
          rejectionReason: reason || 'No reason provided',
          approvedBy: session.user.id
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Error denying user:', updateError)
        return NextResponse.json({ error: 'Failed to deny user' }, { status: 500 })
      }

      // Send denial email
      try {
        const template = await getEmailTemplate('denied')
        if (template) {
          const html = renderTemplate(template.html, {
            name: user.name || user.userId,
            userId: user.userId,
            reason: reason || 'No reason provided'
          })
          await sendEmail({
            to: user.email,
            subject: template.subject,
            html: html
          })
        }
      } catch (emailError) {
        console.error('Failed to send denial email:', emailError)
      }

      return NextResponse.json({ success: true, action: 'denied' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
