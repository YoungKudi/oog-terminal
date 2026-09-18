import { useState, useEffect } from 'react'
import { supabase } from '@/lib/db'

const isWebSocketAvailable = (): boolean => {
  if (typeof window === 'undefined') return false
  return typeof WebSocket !== 'undefined'
}

export function useTabCounts() {
  const [counts, setCounts] = useState({
    queue: 0,
    receivals: 0,
    tallies: 0,
    devanning: 0,
    unstuffed: 0,
    evacuation: 0,
  })

  const fetchCounts = async () => {
    if (!supabase) return

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

    // If WebSocket isn't available, just poll every 30 seconds
    if (!isWebSocketAvailable()) {
      console.warn('⚠️ WebSocket not available - using polling for tab counts')
      const interval = setInterval(fetchCounts, 30000)
      return () => clearInterval(interval)
    }

    if (!supabase) return

    // Try to setup realtime channels (may fail on some networks)
    const channels: any[] = []

    try {
      channels.push(
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
      )

      channels.forEach(ch => {
        try {
          ch.subscribe()
        } catch (err) {
          console.warn('Failed to subscribe to channel:', err)
        }
      })
    } catch (error) {
      console.warn('⚠️ Failed to setup realtime for tab counts:', error)
    }

    // Always poll as a fallback
    const interval = setInterval(fetchCounts, 30000)

    return () => {
      clearInterval(interval)
      try {
        channels.forEach(ch => supabase.removeChannel(ch))
      } catch (error) {
        console.warn('⚠️ Failed to cleanup channels:', error)
      }
    }
  }, [])

  return counts
}
