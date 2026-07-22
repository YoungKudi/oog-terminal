"use client"
import React from 'react'
import { getColor } from '@/lib/utils'

interface DailyTallyProps {
  locations: any[]
  containers: any[]
  isDarkMode: boolean
  greeting: string
  dateStr: string
}

export function DailyTally({ containers, isDarkMode, greeting, dateStr }: DailyTallyProps) {
  return (
    <div style={{ padding: '16px', borderBottom: `1px solid ${getColor(isDarkMode, '#e2e8f0', '#334155')}` }}>
      <h2 style={{ color: getColor(isDarkMode, '#1e293b', '#e2e8f0') }}>{greeting}! 👋</h2>
      <p style={{ color: getColor(isDarkMode, '#64748b', '#94a3b8') }}>{dateStr}</p>
      <p style={{ color: getColor(isDarkMode, '#64748b', '#94a3b8') }}>Total containers: {containers?.length || 0}</p>
    </div>
  )
}
