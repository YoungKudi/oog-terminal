"use client"
import React from 'react'
import { getColor } from '@/lib/utils'

interface StatsGridProps {
  containers: any[]
  importQueue: any[]
  devanningQueue: any[]
  isDarkMode: boolean
}

export function StatsGrid({ containers, importQueue, devanningQueue, isDarkMode }: StatsGridProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', padding: '16px' }}>
      <div style={{ background: getColor(isDarkMode, '#f0fdf4', '#0f172a'), padding: '12px', borderRadius: '8px' }}>
        <div style={{ fontSize: '0.65rem', color: getColor(isDarkMode, '#475569', '#94a3b8') }}>Queue</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: getColor(isDarkMode, '#1e293b', '#e2e8f0') }}>{importQueue?.length || 0}</div>
      </div>
      <div style={{ background: getColor(isDarkMode, '#eff6ff', '#0f172a'), padding: '12px', borderRadius: '8px' }}>
        <div style={{ fontSize: '0.65rem', color: getColor(isDarkMode, '#475569', '#94a3b8') }}>Stack</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: getColor(isDarkMode, '#1e293b', '#e2e8f0') }}>{containers?.length || 0}</div>
      </div>
      <div style={{ background: getColor(isDarkMode, '#fef3c7', '#0f172a'), padding: '12px', borderRadius: '8px' }}>
        <div style={{ fontSize: '0.65rem', color: getColor(isDarkMode, '#475569', '#94a3b8') }}>Devanning</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: getColor(isDarkMode, '#1e293b', '#e2e8f0') }}>{devanningQueue?.length || 0}</div>
      </div>
    </div>
  )
}
