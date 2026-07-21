import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { validateContainerNumber } from '@/lib/utils'
import { getUserIdFromSession } from '@/lib/auth-helpers'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { data, error } = await supabase
    .from('Container')
    .select('*')
    .order('receivedDate', { ascending: false })
  
  if (error) {
    console.error('Error fetching containers:', error)
    return NextResponse.json({ error: 'Failed to fetch containers' }, { status: 500 })
  }
  
  return NextResponse.json(data || [])
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const body = await req.json()
  const { containerNumber, position, size, type, equipment, auxCargo, auxCargoType, auxCargoQuantity, remarks } = body
  
  const validation = validateContainerNumber(containerNumber)
  if (!validation.valid) {
    return NextResponse.json({ error: 'Invalid container number' }, { status: 400 })
  }
  
  const userId = await getUserIdFromSession(session)
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 400 })
  }
  
  const auxCargoDisplay = auxCargoQuantity > 0 ? `${auxCargoQuantity} ${auxCargoType || 'units'}` : auxCargo || ''
  
  const { data: newContainer, error: insertError } = await supabase
    .from('Container')
    .insert({
      containerNumber: validation.normalized,
      position,
      size,
      type,
      equipment,
      auxCargo: auxCargoDisplay,
      auxCargoType: auxCargoType || 'units',
      auxCargoQuantity: auxCargoQuantity || 0,
      remarks: remarks || '',
      userId: userId
    })
    .select()
    .single()
  
  if (insertError) {
    console.error('Error creating container:', insertError)
    return NextResponse.json({ error: 'Failed to create container' }, { status: 500 })
  }
  
  // Log activity with userId
  await supabase
    .from('ActivityLog')
    .insert({
      action: 'ADDED_CONTAINER',
      containerNumber: validation.normalized,
      details: `Added at ${position} | ${equipment}`,
      userId: userId
    })
  
  return NextResponse.json(newContainer, { status: 201 })
}
