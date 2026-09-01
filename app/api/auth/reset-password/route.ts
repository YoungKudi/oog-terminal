import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { sendEmail, getEmailTemplate, renderTemplate } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user by email
    const { data: user, error: findError } = await supabase
      .from('User')
      .select('id, email, userId, name')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (findError || !user) {
      // Don't reveal if user exists (security)
      return NextResponse.json({ 
        success: true, 
        message: 'If an account exists, a reset link has been sent' 
      })
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex')
    const resetExpires = new Date()
    resetExpires.setHours(resetExpires.getHours() + 1) // 1 hour expiry

    // Store reset token in database
    const { error: updateError } = await supabase
      .from('User')
      .update({
        resetToken: resetToken,
        resetExpires: resetExpires.toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error saving reset token:', updateError)
      return NextResponse.json({ error: 'Failed to generate reset link' }, { status: 500 })
    }

    // Send reset email
    try {
      const template = await getEmailTemplate('password_reset')
      if (template) {
        const resetUrl = `${process.env.NEXTAUTH_URL}/auth/update-password?token=${resetToken}&email=${encodeURIComponent(email)}`
        const html = renderTemplate(template.html, {
          name: user.name || user.userId,
          resetUrl: resetUrl
        })
        await sendEmail({
          to: email,
          subject: template.subject,
          html: html
        })
      }
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError)
      // Still return success to prevent email enumeration
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Reset link sent to your email' 
    })
  } catch (error: any) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { token, email, newPassword } = await req.json()
    
    if (!token || !email || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Find user with matching token
    const { data: user, error: findError } = await supabase
      .from('User')
      .select('id, email, resetToken, resetExpires')
      .eq('email', email.toLowerCase().trim())
      .eq('resetToken', token)
      .single()

    if (findError || !user) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
    }

    // Check if token expired
    const resetExpires = new Date(user.resetExpires)
    if (resetExpires < new Date()) {
      return NextResponse.json({ error: 'Reset link has expired' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password and clear reset token
    const { error: updateError } = await supabase
      .from('User')
      .update({
        password: hashedPassword,
        resetToken: null,
        resetExpires: null,
        updatedAt: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Password reset successfully' })
  } catch (error: any) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
