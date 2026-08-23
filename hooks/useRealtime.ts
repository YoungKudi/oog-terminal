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

    const channel = supabase
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
          
          // Try to get user info from ActivityLog
          let userInfo = null
          try {
            // Get the most recent activity for this container
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
          
          onEventRef.current({
            table: payload.table,
            action: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new,
            old: payload.old,
            user: userInfo || undefined
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
