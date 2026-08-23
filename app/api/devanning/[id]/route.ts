import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserIdFromSession } from '@/lib/auth-helpers'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const body = await req.json()
  const { action, step, fuelNeeded, electricalFault, mechanicalFault, damageRemarks, resolveFlag } = body
  
  const userId = await getUserIdFromSession(session)
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 400 })
  }

  // Handle flag resolution
  if (action === 'resolveFlag' && resolveFlag) {
    const validFlags = ['fuel', 'electrical', 'mechanical']
    if (!validFlags.includes(resolveFlag)) {
      return NextResponse.json({ error: 'Invalid flag' }, { status: 400 })
    }
    
    const column = `${resolveFlag}_resolved`
    const atColumn = `${resolveFlag}_resolved_at`
    const byColumn = `${resolveFlag}_resolved_by`
    
    const { error } = await supabase
      .from('DevanningQueue')
      .update({
        [column]: true,
        [atColumn]: new Date().toISOString(),
        [byColumn]: userId
      })
      .eq('id', params.id)
    
    if (error) {
      console.error('Error resolving flag:', error)
      return NextResponse.json({ error: 'Failed to resolve flag' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  }

  // Handle step completion
  if (action === 'completeStep' && step) {
    const validSteps = ['breaking', 'positioned', 'unlashing', 'ready_to_drop']
    if (!validSteps.includes(step)) {
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
    }
    
    const stepColumn = `step_${step}`
    const stepAtColumn = `step_${step}_at`
    
    const { error } = await supabase
      .from('DevanningQueue')
      .update({
        [stepColumn]: true,
        [stepAtColumn]: new Date().toISOString(),
        devanningStatus: step,
        statusUpdatedAt: new Date().toISOString(),
        statusUpdatedBy: userId,
        fuelNeeded: fuelNeeded || false,
        electricalFault: electricalFault || false,
        mechanicalFault: mechanicalFault || false,
        damageRemarks: damageRemarks || ''
      })
      .eq('id', params.id)
    
    if (error) {
      console.error('Error completing step:', error)
      return NextResponse.json({ error: 'Failed to complete step' }, { status: 500 })
    }
    
    // Log step completion
    await supabase
      .from('DevanningStepHistory')
      .insert({
        devanningId: params.id,
        stepName: step.charAt(0).toUpperCase() + step.slice(1),
        completed: true,
        completedBy: userId,
        notes: ''
      })
    
    return NextResponse.json({ success: true, step })
  }

  // Handle unstuff
  if (action === 'unstuff') {
    const { data: d, error: fetchError } = await supabase
      .from('DevanningQueue')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (fetchError || !d) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    const cleanVessel = d.vessel && d.vessel.trim() !== '' ? d.vessel.trim() : null
    const cleanArrivalDate = d.arrivalDate && d.arrivalDate.trim() !== '' ? d.arrivalDate.trim() : null
    
    // Check if already unstuffed
    const { data: existing } = await supabase
      .from('UnstuffedContainer')
      .select('id')
      .eq('containerNumber', d.containerNumber)
    
    if (existing && existing.length > 0) {
      await supabase
        .from('DevanningQueue')
        .delete()
        .eq('id', params.id)
      return NextResponse.json({ success: true, message: 'Already unstuffed' })
    }
    
    // Insert into UnstuffedContainer
    const { error: insertError } = await supabase
      .from('UnstuffedContainer')
      .insert({
        containerNumber: d.containerNumber,
        size: d.size,
        type: d.type,
        position: d.position,
        equipment: d.equipment,
        auxCargo: d.auxCargo || '',
        auxCargoType: d.auxCargoType || 'units',
        auxCargoQuantity: d.auxCargoQuantity || 0,
        vessel: cleanVessel,
        arrivalDate: cleanArrivalDate,
        agency: d.agency || '',
        devanningType: d.devanningType || 'unstuffing',
        remarks: d.remarks || '',
        userId: userId
      })
    
    if (insertError) {
      console.error('Error inserting unstuffed:', insertError)
      return NextResponse.json({ error: 'Failed to unstuff' }, { status: 500 })
    }
    
    // Delete from DevanningQueue
    await supabase
      .from('DevanningQueue')
      .delete()
      .eq('id', params.id)
    
    await supabase
      .from('ActivityLog')
      .insert({
        action: 'UNSTUFFED',
        containerNumber: d.containerNumber,
        details: 'Container unstuffed',
        userId: userId
      })
    
    return NextResponse.json({ success: true })
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
