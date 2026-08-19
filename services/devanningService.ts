import { supabase } from '@/lib/db'

export async function getDevanningQueue() {
  const { data, error } = await supabase
    .from('DevanningQueue')
    .select('*')
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Error fetching devanning queue:', error)
    throw error
  }

  return data || []
}

export async function getDevanningById(id: string) {
  const { data, error } = await supabase
    .from('DevanningQueue')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching devanning record:', error)
    throw error
  }

  return data
}

export async function createDevanningRecord(recordData: any) {
  const { data, error } = await supabase
    .from('DevanningQueue')
    .insert(recordData)
    .select()
    .single()

  if (error) {
    console.error('Error creating devanning record:', error)
    throw error
  }

  return data
}

export async function updateDevanningStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('DevanningQueue')
    .update({ status, statusUpdatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating devanning status:', error)
    throw error
  }

  return data
}

export async function updateDevanningStep(id: string, step: string, value: boolean) {
  const { data, error } = await supabase
    .from('DevanningQueue')
    .update({ [step]: value, statusUpdatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`Error updating ${step}:`, error)
    throw error
  }

  return data
}
