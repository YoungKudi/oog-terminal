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
  
  const { containerNumber, source } = await req.json() // source: 'stack' or 'unstuffed'
  const userId = await getUserIdFromSession(session)
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 400 })
  }
  
  let container = null
  let sourceTable = ''
  
  // Check in Container (stack) first
  if (source === 'stack' || !source) {
    const { data, error } = await supabase
      .from('Container')
      .select('*')
      .eq('containerNumber', containerNumber)
      .single()
    
    if (!error && data) {
      container = data
      sourceTable = 'Container'
    }
  }
  
  // If not in stack, check UnstuffedContainer
  if (!container) {
    const { data, error } = await supabase
      .from('UnstuffedContainer')
      .select('*')
      .eq('containerNumber', containerNumber)
      .single()
    
    if (!error && data) {
      container = data
      sourceTable = 'UnstuffedContainer'
    }
  }
  
  if (!container) {
    return NextResponse.json({ error: 'Container not found in stack or unstuffed' }, { status: 404 })
  }
  
  // Check if already evacuated
  const { data: existing } = await supabase
    .from('EvacuationRecord')
    .select('id')
    .eq('containerNumber', containerNumber)
    .single()
  
  if (existing) {
    return NextResponse.json({ error: 'Container already evacuated' }, { status: 400 })
  }
  
  // Move to EvacuationRecord
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
      source: sourceTable, // Track where it came from
      userId: userId
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error evacuating container:', error)
    return NextResponse.json({ error: 'Failed to evacuate' }, { status: 500 })
  }
  
  // Delete from source table
  await supabase
    .from(sourceTable)
    .delete()
    .eq('containerNumber', containerNumber)
  
  await supabase
    .from('ActivityLog')
    .insert({
      action: 'EVACUATED',
      containerNumber: containerNumber,
      details: `Container evacuated from ${sourceTable}`,
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
  
  // Return to original source or Container
  const targetTable = evac.source === 'UnstuffedContainer' ? 'UnstuffedContainer' : 'Container'
  
  const { error: insertError } = await supabase
    .from(targetTable)
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
      details: `Returned from evacuation to ${targetTable}`,
      userId: userId
    })
  
  return NextResponse.json({ success: true })
}
