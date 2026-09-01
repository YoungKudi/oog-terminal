import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { sendEmail, getEmailTemplate, renderTemplate } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { workerId } = await req.json()
    
    if (!workerId) {
      return NextResponse.json({ error: 'Worker ID required' }, { status: 400 })
    }

    // Find user
    const { data: user, error } = await supabase
      .from('User')
      .select('*')
      .eq('userId', workerId.toUpperCase().trim())
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.approved === true) {
      return NextResponse.json({ error: 'User already approved' }, { status: 400 })
    }

    // Send pending approval email
    const template = await getEmailTemplate('pending_approval')
    if (template) {
      const html = renderTemplate(template.html, {
        name: user.name || user.userId,
        userId: user.userId,
        email: user.email
      })
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: html
      })
    }

    return NextResponse.json({ success: true, message: 'Approval notification sent' })
  } catch (error) {
    console.error('Error resending approval:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
