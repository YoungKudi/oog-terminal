import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserIdFromSession } from '@/lib/auth-helpers'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('LoadoutRecord')
      .select('*')
      .order('clearedAt', { ascending: false })

    if (error) {
      console.error('❌ Error fetching loadout records:', error)
      return NextResponse.json({ error: 'Failed to fetch loadout records' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('❌ Loadout GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const userId = await getUserIdFromSession(session)

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }

    const {
      containerNumber,
      size,
      type,
      equipment,
      vessel,
      arrivalDate,
      unstuffedDate,
      deliveryDate,
      location,
      content,
      truckPlate,
      agentContact,
      boxesLoaded,
      devanningType,
      remarks,
      isDouble
    } = body

    if (!containerNumber || !truckPlate) {
      return NextResponse.json({ error: 'Container number and truck plate required' }, { status: 400 })
    }

    // Insert into LoadoutRecord
    const { data, error } = await supabase
      .from('LoadoutRecord')
      .insert({
        containerNumber: containerNumber.toUpperCase().trim(),
        size: size || '',
        type: type || '',
        equipment: equipment || '',
        vessel: vessel || '',
        arrivalDate: arrivalDate || null,
        unstuffedDate: unstuffedDate || new Date().toISOString().split('T')[0],
        deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
        location: location || '',
        content: content || '',
        truckPlate: truckPlate.toUpperCase().trim(),
        agentContact: agentContact || '',
        boxesLoaded: parseInt(boxesLoaded) || 0,
        devanningType: devanningType || 'unstuffing',
        remarks: remarks || '',
        isDouble: isDouble || false,
        userId: userId
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating loadout:', error)
      return NextResponse.json({ error: 'Failed to create loadout record' }, { status: 500 })
    }

    // Delete from UnstuffedContainer
    await supabase
      .from('UnstuffedContainer')
      .delete()
      .eq('containerNumber', containerNumber.toUpperCase().trim())

    // Log activity
    await supabase
      .from('ActivityLog')
      .insert({
        action: 'CLEARED',
        containerNumber: containerNumber.toUpperCase().trim(),
        details: `Cleared with truck ${truckPlate}`,
        userId: userId
      })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('❌ Loadout POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
