import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  console.log('📥 Signup request received')
  
  try {
    const body = await req.json()
    console.log('📝 Body keys:', Object.keys(body))

    const { email, workerId, password, phone, name } = body

    if (!email || !workerId || !password || !phone) {
      console.log('❌ Missing fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const cleanWorkerId = workerId.toUpperCase().trim()
    console.log('🔍 Worker ID:', cleanWorkerId)

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('🔐 Password hashed')

    // Check if user exists
    console.log('🔍 Checking existing user...')
    const { data: existingUser, error: checkError } = await supabase
      .from('User')
      .select('id')
      .eq('userId', cleanWorkerId)

    if (checkError) {
      console.error('❌ Check error:', checkError)
      return NextResponse.json({ error: 'Database error: ' + checkError.message }, { status: 500 })
    }

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({ error: 'Worker ID already taken' }, { status: 400 })
    }

    // Check email
    const { data: existingEmail, error: emailCheckError } = await supabase
      .from('User')
      .select('id')
      .eq('email', email.toLowerCase().trim())

    if (emailCheckError) {
      console.error('❌ Email check error:', emailCheckError)
      return NextResponse.json({ error: 'Database error: ' + emailCheckError.message }, { status: 500 })
    }

    if (existingEmail && existingEmail.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // ✅ INSERT USER
    console.log('📤 Inserting user...')
    const { data: newUser, error: insertError } = await supabase
      .from('User')
      .insert({
        name: name || workerId,
        email: email.toLowerCase().trim(),
        userId: cleanWorkerId,
        phone: phone,
        password: hashedPassword,
        role: 'user'
      })
      .select('id, name, email, userId, phone, role')

    if (insertError) {
      console.error('❌ Insert error:', insertError)
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: insertError.message 
      }, { status: 500 })
    }

    console.log('✅ User created:', newUser)
    return NextResponse.json({ success: true, user: newUser?.[0] || null }, { status: 201 })
  } catch (error: any) {
    console.error('❌ Signup error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
