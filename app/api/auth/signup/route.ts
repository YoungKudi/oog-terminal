import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import bcrypt from 'bcryptjs'

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
        error: 'Worker ID must be either 7 digits or 2 letters + 6 digits' 
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
      .single()
    
    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, user: newUser }, { status: 201 })
  } catch (error: any) {
    console.error('Signup error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
