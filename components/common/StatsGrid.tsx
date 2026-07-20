import React from 'react'
import { parseCargoNumber } from '@/lib/utils'
import { getColor } from '@/lib/utils'

interface StatsGridProps {
  containers: any[]
  importQueue: any[]
  devanningQueue: any[]
  isDarkMode: boolean
}

export function StatsGrid({ containers, importQueue, devanningQueue, isDarkMode }: StatsGridProps) {
  const total = containers.length
  const excavators = containers.filter(c => c.equipment === 'Excavator' || c.equipment === '2x Excavator').length
  const cargo = containers.reduce((s, c) => s + parseCargoNumber(c.auxCargo), 0)
  const devanning = devanningQueue.length
  const queue = importQueue.length

  const stats = [
    { label: '📊 Stack', value: total },
    { label: '🚜 Excavators', value: excavators },
    { label: '📦 Cargo', value: cargo },
    { label: '⏳ Devanning', value: devanning },
    { label: '📥 Queue', value: queue }
  ]

  return (
    <div className="stats-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(90px, 1fr))',gap:'8px',marginBottom:'12px'}}>
      {stats.map((stat, i) => (
        <div key={i} className="stat-card" style={{background: getColor(isDarkMode, '#f8fafc', '#1e293b'), borderRadius:'12px', padding:'8px 10px', textAlign:'center', border: getColor(isDarkMode, '1px solid #e2e8f0', '1px solid #334155')}}>
          <div className="num" style={{fontSize:'1.2rem',fontWeight:'700',color: getColor(isDarkMode, '#1e293b', '#e2e8f0')}}>{stat.value}</div>
          <div className="label" style={{fontSize:'0.6rem',color: getColor(isDarkMode, '#64748b', '#94a3b8')}}>{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
