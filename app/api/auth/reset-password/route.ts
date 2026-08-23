import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user by email
    const { data: users, error: findError } = await supabase
      .from('User')
      .select('id, email, userId')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (findError || !users) {
      // Don't reveal if user exists or not (security)
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
      .eq('id', users.id)

    if (updateError) {
      console.error('Error saving reset token:', updateError)
      return NextResponse.json({ error: 'Failed to generate reset link' }, { status: 500 })
    }

    // In production, send email with reset link
    // For now, return the reset link (in development)
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
    
    // Log the reset request
    await supabase
      .from('ActivityLog')
      .insert({
        action: 'PASSWORD_RESET_REQUESTED',
        details: `Password reset requested for ${email}`,
        userId: users.id
      })

    return NextResponse.json({ 
      success: true, 
      message: 'Reset link sent to your email',
      resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
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
    const { data: users, error: findError } = await supabase
      .from('User')
      .select('id, email, resetToken, resetExpires')
      .eq('email', email.toLowerCase().trim())
      .eq('resetToken', token)
      .single()

    if (findError || !users) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
    }

    // Check if token expired
    const resetExpires = new Date(users.resetExpires)
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
      .eq('id', users.id)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
    }

    // Log the reset
    await supabase
      .from('ActivityLog')
      .insert({
        action: 'PASSWORD_RESET_COMPLETED',
        details: `Password reset completed for ${email}`,
        userId: users.id
      })

    return NextResponse.json({ success: true, message: 'Password reset successfully' })
  } catch (error: any) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
