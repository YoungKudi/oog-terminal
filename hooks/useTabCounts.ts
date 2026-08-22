import { useState, useEffect } from 'react'
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
  const [previousCounts, setPreviousCounts] = useState(counts)

  const fetchCounts = async () => {
    try {
      const [
        { count: queueCount },
        { count: receivalsCount },
        { count: talliesCount },
        { count: devanningCount },
        { count: unstuffedCount },
        { count: evacuationCount },
      ] = await Promise.all([
        supabase.from('ImportQueue').select('*', { count: 'exact', head: true }),
        supabase.from('Container').select('*', { count: 'exact', head: true }),
        supabase.from('Container').select('*', { count: 'exact', head: true }),
        supabase.from('DevanningQueue').select('*', { count: 'exact', head: true }),
        supabase.from('UnstuffedContainer').select('*', { count: 'exact', head: true }),
        supabase.from('EvacuationRecord').select('*', { count: 'exact', head: true }),
      ])

      setPreviousCounts(counts)
      setCounts({
        queue: queueCount || 0,
        receivals: receivalsCount || 0,
        tallies: talliesCount || 0,
        devanning: devanningCount || 0,
        unstuffed: unstuffedCount || 0,
        evacuation: evacuationCount || 0,
      })
    } catch (error) {
      console.error('Error fetching tab counts:', error)
    }
  }

  useEffect(() => {
    fetchCounts()

    const channels = [
      supabase.channel('queue-count').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ImportQueue' },
        () => fetchCounts()
      ),
      supabase.channel('container-count').on('postgres_changes',
        { event: '*', schema: 'public', table: 'Container' },
        () => fetchCounts()
      ),
      supabase.channel('devanning-count').on('postgres_changes',
        { event: '*', schema: 'public', table: 'DevanningQueue' },
        () => fetchCounts()
      ),
      supabase.channel('unstuffed-count').on('postgres_changes',
        { event: '*', schema: 'public', table: 'UnstuffedContainer' },
        () => fetchCounts()
      ),
      supabase.channel('evacuation-count').on('postgres_changes',
        { event: '*', schema: 'public', table: 'EvacuationRecord' },
        () => fetchCounts()
      ),
    ]

    channels.forEach(ch => ch.subscribe())

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch))
    }
  }, [])

  return counts
}
