"use client"
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/db'

interface TabBadgeProps {
  tabId: string
  count: number
}

export function TabBadge({ tabId, count }: TabBadgeProps) {
  if (count === 0) return null
  
  return (
    <span
      style={{
        position: 'absolute',
        top: '-4px',
        right: '-8px',
        background: '#dc2626',
        color: 'white',
        borderRadius: '50%',
        padding: '1px 5px',
        fontSize: '0.5rem',
        fontWeight: 'bold',
        minWidth: '16px',
        textAlign: 'center',
        lineHeight: '1.4',
      }}
    >
      {count > 9 ? '9+' : count}
    </span>
  )
}

// Hook to get today's activities count per tab
export function useTodayActivityCounts() {
  const [counts, setCounts] = useState({
    queue: 0,
    receivals: 0,
    tallies: 0,
    devanning: 0,
    unstuffed: 0,
    evacuation: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayStr = today.toISOString()

        // Get today's activities counts
        const { data, error } = await supabase
          .from('ActivityLog')
          .select('action, containerNumber')
          .gte('createdAt', todayStr)

        if (error) throw error

        // Count per tab
        const newCounts = {
          queue: data?.filter(a => a.action === 'ADDED_TO_QUEUE' || a.action === 'IMPORTED').length || 0,
          receivals: data?.filter(a => a.action === 'ADDED_CONTAINER' || a.action === 'RECEIVED').length || 0,
          tallies: data?.filter(a => a.action === 'MOVED' || a.action === 'UPDATED').length || 0,
          devanning: data?.filter(a => a.action === 'DEVANNING_STARTED' || a.action === 'STEP_COMPLETED').length || 0,
          unstuffed: data?.filter(a => a.action === 'UNSTUFFED').length || 0,
          evacuation: data?.filter(a => a.action === 'EVACUATED' || a.action === 'EVACUATION_RETURNED').length || 0,
        }

        setCounts(newCounts)
      } catch (e) {
        console.error('Error fetching activity counts:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()
  }, [])

  return { counts, loading }
}
