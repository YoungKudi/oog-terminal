import { useEffect, useState } from 'react'
import { supabase } from '@/lib/db'

export function useTabCounts() {
  const [counts, setCounts] = useState({
    queue: 0,
    receivals: 0,
    tallies: 0,
    devanning: 0,
    unstuffed: 0,
    evacuation: 0,
  })

  useEffect(() => {
    fetchCounts()
    
    // Set up real-time subscriptions
    const channels = [
      supabase.channel('count-queue').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ImportQueue' }, 
        () => fetchCounts()
      ),
      supabase.channel('count-containers').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'Container' }, 
        () => fetchCounts()
      ),
      supabase.channel('count-devanning').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'DevanningQueue' }, 
        () => fetchCounts()
      ),
      supabase.channel('count-unstuffed').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'UnstuffedContainer' }, 
        () => fetchCounts()
      ),
      supabase.channel('count-evacuation').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'EvacuationRecord' }, 
        () => fetchCounts()
      ),
    ]
    
    channels.forEach(ch => ch.subscribe())
    
    return () => {
      channels.forEach(ch => supabase.removeChannel(ch))
    }
  }, [])

  async function fetchCounts() {
    try {
      const [queue, containers, devanning, unstuffed, evacuation] = await Promise.all([
        supabase.from('ImportQueue').select('id', { count: 'exact' }),
        supabase.from('Container').select('id', { count: 'exact' }),
        supabase.from('DevanningQueue').select('id', { count: 'exact' }),
        supabase.from('UnstuffedContainer').select('id', { count: 'exact' }),
        supabase.from('EvacuationRecord').select('id', { count: 'exact' }),
      ])

      setCounts({
        queue: queue.count || 0,
        receivals: containers.count || 0,
        tallies: containers.count || 0,
        devanning: devanning.count || 0,
        unstuffed: unstuffed.count || 0,
        evacuation: evacuation.count || 0,
      })
    } catch (error) {
      console.error('Error fetching counts:', error)
    }
  }

  return counts
}
