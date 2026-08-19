import { supabase } from '@/lib/db'

export async function getContainers() {
  const { data, error } = await supabase
    .from('Container')
    .select('*')
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Error fetching containers:', error)
    throw error
  }

  return data || []
}

export async function getContainerById(id: string) {
  const { data, error } = await supabase
    .from('Container')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching container:', error)
    throw error
  }

  return data
}

export async function createContainer(containerData: any) {
  const { data, error } = await supabase
    .from('Container')
    .insert(containerData)
    .select()
    .single()

  if (error) {
    console.error('Error creating container:', error)
    throw error
  }

  return data
}

export async function updateContainer(id: string, containerData: any) {
  const { data, error } = await supabase
    .from('Container')
    .update(containerData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating container:', error)
    throw error
  }

  return data
}

export async function deleteContainer(id: string) {
  const { error } = await supabase
    .from('Container')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting container:', error)
    throw error
  }

  return true
}
