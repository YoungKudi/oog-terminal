import { useEffect, useState } from 'react'
import { supabase } from '@/lib/db'
import { useToast } from './useToast'

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

  useEffect(() => {
    const channel = supabase
      .channel(`table-changes-${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        (payload) => {
          console.log('📡 Realtime event:', payload)
          onEvent({
            table: payload.table,
            action: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new,
            old: payload.old,
          })
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
        console.log(`📡 Realtime ${table} status:`, status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, onEvent])

  return { isConnected }
}
