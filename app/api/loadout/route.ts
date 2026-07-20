import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserIdFromSession } from '@/lib/auth-helpers'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { data, error } = await supabase
    .from('LoadoutRecord')
    .select('*')
    .order('clearedAt', { ascending: false })
  
  if (error) {
    console.error('Error fetching loadout records:', error)
    return NextResponse.json({ error: 'Failed to fetch loadout records' }, { status: 500 })
  }
  
  return NextResponse.json(data || [])
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const body = await req.json()
  const userId = await getUserIdFromSession(session)
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 400 })
  }
  
  const { 
    containerNumber, size, type, equipment, vessel, arrivalDate, 
    unstuffedDate, deliveryDate, location, content, truckPlate, 
    agentContact, boxesLoaded, devanningType, remarks 
  } = body
  
  // Check if container is in unstuffed
  const { data: existing, error: checkError } = await supabase
    .from('UnstuffedContainer')
    .select('id')
    .eq('containerNumber', containerNumber.toUpperCase().trim())
  
  if (checkError) {
    console.error('Error checking unstuffed:', checkError)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
  
  if (!existing || existing.length === 0) {
    return NextResponse.json({ error: 'Container not found in unstuffed list' }, { status: 400 })
  }
  
  const { data, error } = await supabase
    .from('LoadoutRecord')
    .insert({
      containerNumber: containerNumber.toUpperCase().trim(),
      size,
      type,
      equipment,
      vessel: vessel || '',
      arrivalDate: arrivalDate || null,
      unstuffedDate: unstuffedDate || null,
      deliveryDate: deliveryDate || null,
      location: location || '',
      content: content || '',
      truckPlate,
      agentContact: agentContact || '',
      boxesLoaded: parseInt(boxesLoaded) || 0,
      devanningType: devanningType || '',
      remarks: remarks || '',
      userId: userId
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating loadout:', error)
    return NextResponse.json({ error: 'Failed to create loadout' }, { status: 500 })
  }
  
  // Delete from UnstuffedContainer
  await supabase
    .from('UnstuffedContainer')
    .delete()
    .eq('containerNumber', containerNumber.toUpperCase().trim())
  
  await supabase
    .from('ActivityLog')
    .insert({
      action: 'CLEARED',
      containerNumber: containerNumber.toUpperCase().trim(),
      details: `Cleared with truck ${truckPlate}`,
      userId: userId
    })
  
  return NextResponse.json(data, { status: 201 })
}
