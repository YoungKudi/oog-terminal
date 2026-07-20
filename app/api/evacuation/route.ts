import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserIdFromSession } from '@/lib/auth-helpers'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { data, error } = await supabase
    .from('EvacuationRecord')
    .select('*')
    .order('evacuatedAt', { ascending: false })
  
  if (error) {
    console.error('Error fetching evacuation records:', error)
    return NextResponse.json({ error: 'Failed to fetch evacuation records' }, { status: 500 })
  }
  
  return NextResponse.json(data || [])
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { containerNumber } = await req.json()
  const userId = await getUserIdFromSession(session)
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 400 })
  }
  
  // Get container from Unstuffed
  const { data: container, error: fetchError } = await supabase
    .from('UnstuffedContainer')
    .select('*')
    .eq('containerNumber', containerNumber)
    .single()
  
  if (fetchError || !container) {
    return NextResponse.json({ error: 'Container not found in unstuffed' }, { status: 404 })
  }
  
  const { data, error } = await supabase
    .from('EvacuationRecord')
    .insert({
      containerNumber: container.containerNumber,
      size: container.size,
      type: container.type,
      position: container.position,
      equipment: container.equipment,
      vessel: container.vessel || '',
      arrivalDate: container.arrivalDate || '',
      auxCargo: container.auxCargo || '',
      devanningType: container.devanningType || '',
      userId: userId
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error evacuating container:', error)
    return NextResponse.json({ error: 'Failed to evacuate' }, { status: 500 })
  }
  
  // Delete from UnstuffedContainer
  await supabase
    .from('UnstuffedContainer')
    .delete()
    .eq('containerNumber', containerNumber)
  
  await supabase
    .from('ActivityLog')
    .insert({
      action: 'EVACUATED',
      containerNumber: containerNumber,
      details: 'Container evacuated',
      userId: userId
    })
  
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const url = new URL(req.url)
  const containerNumber = url.searchParams.get('containerNumber')
  if (!containerNumber) {
    return NextResponse.json({ error: 'Missing container number' }, { status: 400 })
  }
  
  const userId = await getUserIdFromSession(session)
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 400 })
  }
  
  // Get from EvacuationRecord
  const { data: evac, error: fetchError } = await supabase
    .from('EvacuationRecord')
    .select('*')
    .eq('containerNumber', containerNumber)
    .single()
  
  if (fetchError || !evac) {
    return NextResponse.json({ error: 'Not found in evacuation' }, { status: 404 })
  }
  
  // Return to UnstuffedContainer
  const { error: insertError } = await supabase
    .from('UnstuffedContainer')
    .insert({
      containerNumber: evac.containerNumber,
      size: evac.size,
      type: evac.type,
      position: evac.position,
      equipment: evac.equipment,
      vessel: evac.vessel || '',
      arrivalDate: evac.arrivalDate || '',
      auxCargo: evac.auxCargo || '',
      devanningType: evac.devanningType || '',
      remarks: '',
      userId: userId
    })
  
  if (insertError) {
    console.error('Error returning from evacuation:', insertError)
    return NextResponse.json({ error: 'Failed to return from evacuation' }, { status: 500 })
  }
  
  // Delete from EvacuationRecord
  await supabase
    .from('EvacuationRecord')
    .delete()
    .eq('containerNumber', containerNumber)
  
  await supabase
    .from('ActivityLog')
    .insert({
      action: 'EVACUATION_RETURNED',
      containerNumber: containerNumber,
      details: 'Returned from evacuation',
      userId: userId
    })
  
  return NextResponse.json({ success: true })
}
