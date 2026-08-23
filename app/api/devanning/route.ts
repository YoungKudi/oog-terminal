import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserIdFromSession } from '@/lib/auth-helpers'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { data, error } = await supabase
    .from('DevanningQueue')
    .select('*')
    .order('movedToDevanAt', { ascending: false })
  
  if (error) {
    console.error('Error fetching devanning queue:', error)
    return NextResponse.json({ error: 'Failed to fetch devanning queue' }, { status: 500 })
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
    containerNumber, containerId, position, size, type, equipment, 
    auxCargo, auxCargoType, auxCargoQuantity, vessel, arrivalDate, 
    devanningType, agency, remarks 
  } = body
  
  const cleanVessel = vessel && vessel.trim() !== '' ? vessel.trim() : null
  const cleanArrivalDate = arrivalDate && arrivalDate.trim() !== '' ? arrivalDate.trim() : null
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('DevanningQueue')
    .insert({
      containerNumber: containerNumber.toUpperCase().trim(),
      size,
      type,
      position,
      equipment,
      auxCargo: auxCargo || '',
      auxCargoType: auxCargoType || 'units',
      auxCargoQuantity: auxCargoQuantity || 0,
      vessel: cleanVessel,
      arrivalDate: cleanArrivalDate,
      devanningType: devanningType || 'unstuffing',
      agency: agency || '',
      remarks: remarks || '',
      userId: userId,
      devanningStatus: 'in_stack',
      bookedDate: today
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating devanning record:', error)
    return NextResponse.json({ error: 'Failed to create devanning record' }, { status: 500 })
  }
  
  // Remove from Container if containerId provided
  if (containerId) {
    await supabase
      .from('Container')
      .delete()
      .eq('id', containerId)
  }
  
  await supabase
    .from('ActivityLog')
    .insert({
      action: 'DEVANNING_STARTED',
      containerNumber: containerNumber.toUpperCase().trim(),
      details: `Moved to devanning | ${devanningType}`,
      userId: userId
    })
  
  return NextResponse.json(data, { status: 201 })
}
