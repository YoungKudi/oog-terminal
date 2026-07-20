import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/db'

type RealtimeEvent = {
  table: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  new: any
  old: any
}

export function useRealtime(
  table: string,
  onEvent: (event: RealtimeEvent) => void
) {
  const [isConnected, setIsConnected] = useState(false)
  const onEventRef = useRef(onEvent)

  // Update ref when onEvent changes
  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    // Only subscribe if table is provided
    if (!table) return

    const channel = supabase
      .channel(`table-changes-${table}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        (payload) => {
          console.log(`📡 Realtime event on ${table}:`, payload.eventType, payload)
          onEventRef.current({
            table: payload.table,
            action: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new,
            old: payload.old,
          })
        }
      )
      .subscribe((status) => {
        const connected = status === 'SUBSCRIBED'
        setIsConnected(connected)
        console.log(`📡 Realtime ${table} status:`, status)
      })

    return () => {
      console.log(`📡 Unsubscribing from ${table}`)
      supabase.removeChannel(channel)
    }
  }, [table])

  return { isConnected }
}
