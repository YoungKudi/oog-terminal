import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { sendEmail, getEmailTemplate, renderTemplate } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, workerId, password, phone, name } = body

    if (!email || !workerId || !password || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const workerIdRegex1 = /^\d{7}$/
    const workerIdRegex2 = /^[A-Z]{2}\d{6}$/
    const cleanWorkerId = workerId.toUpperCase().trim()

    if (!workerIdRegex1.test(cleanWorkerId) && !workerIdRegex2.test(cleanWorkerId)) {
      return NextResponse.json({
        error: 'Worker ID must be either:\n• 7 digits (e.g., 4567423)\n• 2 letters + 6 digits (e.g., TC246789)'
      }, { status: 400 })
    }

    // Check if worker ID exists
    const { data: existingUser, error: checkError } = await supabase
      .from('User')
      .select('id')
      .eq('userId', cleanWorkerId)

    if (checkError) {
      console.error('Check error:', checkError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({ error: 'Worker ID already taken' }, { status: 400 })
    }

    // Check if email exists
    const { data: existingEmail, error: emailCheckError } = await supabase
      .from('User')
      .select('id')
      .eq('email', email.toLowerCase().trim())

    if (emailCheckError) {
      console.error('Email check error:', emailCheckError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (existingEmail && existingEmail.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert user with pending approval
    const { data: newUser, error: insertError } = await supabase
      .from('User')
      .insert({
        name: name || workerId,
        email: email.toLowerCase().trim(),
        userId: cleanWorkerId,
        phone: phone,
        password: hashedPassword,
        role: 'user',
        approved: false // Requires admin approval
      })
      .select('id, name, email, userId, phone, role')
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Send welcome email
    try {
      const template = await getEmailTemplate('welcome')
      if (template) {
        const html = renderTemplate(template.html, {
          name: name || workerId,
          userId: cleanWorkerId
        })
        await sendEmail({
          to: email,
          subject: template.subject,
          html: html
        })
      }
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail signup if email fails
    }

    return NextResponse.json({ 
      success: true, 
      user: newUser,
      message: 'Account created! Please wait for admin approval.',
      pendingApproval: true 
    }, { status: 201 })
  } catch (error: any) {
    console.error('Signup error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
