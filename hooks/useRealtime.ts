import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/db'

type RealtimeEvent = {
  table: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  new: any
  old: any
  user?: {
    id: string
    name: string
    userId: string
  }
}

// Check if WebSocket is available in this browser
const isWebSocketAvailable = (): boolean => {
  if (typeof window === 'undefined') return false
  return typeof WebSocket !== 'undefined'
}

export function useRealtime(
  table: string,
  onEvent: (event: RealtimeEvent) => void
) {
  const [isConnected, setIsConnected] = useState(false)
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    if (!table) return

    // Skip realtime entirely if WebSocket isn't available (e.g., corporate firewall)
    if (!isWebSocketAvailable()) {
      console.warn(`⚠️ WebSocket not available - realtime disabled for ${table}`)
      return
    }

    // Skip if Supabase isn't configured
    if (!supabase) {
      console.warn(`⚠️ Supabase not available - realtime disabled for ${table}`)
      return
    }

    let channel: any = null

    try {
      channel = supabase
        .channel(`table-changes-${table}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
          },
          async (payload) => {
            console.log(`📡 Realtime event on ${table}:`, payload.eventType, payload)

            let userInfo = null
            try {
              const { data: activity } = await supabase
                .from('ActivityLog')
                .select('userId, User!inner(name, userId)')
                .eq('containerNumber', payload.new?.containerNumber || payload.old?.containerNumber)
                .order('createdAt', { ascending: false })
                .limit(1)

              if (activity && activity.length > 0 && activity[0].User) {
                userInfo = {
                  id: activity[0].userId,
                  name: activity[0].User.name,
                  userId: activity[0].User.userId
                }
              }
            } catch (error) {
              console.warn('Could not fetch user info:', error)
            }

            try {
              onEventRef.current({
                table: payload.table,
                action: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
                new: payload.new,
                old: payload.old,
                user: userInfo || undefined
              })
            } catch (err) {
              console.warn('Error in realtime callback:', err)
            }
          }
        )
        .subscribe((status) => {
          const connected = status === 'SUBSCRIBED'
          setIsConnected(connected)
          console.log(`📡 Realtime ${table} status:`, status)
        })
    } catch (error) {
      console.warn(`⚠️ Failed to setup realtime for ${table}:`, error)
      setIsConnected(false)
    }

    return () => {
      try {
        if (channel) {
          supabase.removeChannel(channel)
        }
      } catch (error) {
        console.warn(`⚠️ Failed to cleanup realtime for ${table}:`, error)
      }
    }
  }, [table])

  return { isConnected }
}
