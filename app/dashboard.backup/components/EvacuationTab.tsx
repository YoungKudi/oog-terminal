import React from 'react'
import { getColor, formatDate, parseCargoNumber } from '@/lib/utils'

interface EvacuationTabProps {
  evacuationRecords: any[]
  isDarkMode: boolean
  showToast: (msg: string) => void
  fetchAllData: () => void
}

export default function EvacuationTab({
  evacuationRecords,
  isDarkMode,
  showToast,
  fetchAllData
}: EvacuationTabProps) {
  const removeFromEvacuation = async (num: string) => {
    if (!confirm('Return ' + num + ' from evacuation?')) return
    try {
      const res = await fetch('/api/evacuation?containerNumber=' + num, { method: 'DELETE' })
      if (res.ok) { showToast('↩️ Returned'); fetchAllData() } else { showToast('❌ Failed') }
    } catch (err) { showToast('❌ Network error') }
  }

  return (
    <div className="card" style={{background: getColor(isDarkMode, 'white', '#111827'), borderRadius:'16px', marginBottom:'14px', border: getColor(isDarkMode, '1px solid #eef2f6', '1px solid #1f2937')}}>
      <div className="list-header" style={{background: getColor(isDarkMode, '#fefce8', '#0f172a'), borderRadius:'16px 16px 0 0', padding:'8px 14px', borderBottom: getColor(isDarkMode, '2px solid #eab308', '2px solid #8b5cf6'), display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'6px', color: getColor(isDarkMode, '#1e293b', '#f1f5f9')}}>
        <span>🚚 Evacuated Containers</span>
      </div>
      <div className="card-body" style={{padding:'10px 14px'}}>
        <p style={{fontSize:'0.8rem',color: getColor(isDarkMode, '#64748b', '#94a3b8'),marginBottom:'10px'}}>Containers with remaining cargo after partial loadout appear here.</p>
        <div>
          {evacuationRecords.length === 0 ? (
            <div style={{padding:'16px',textAlign:'center',color:'#64748b',fontSize:'0.75rem'}}>🚚 No evacuated containers</div>
          ) : (
            evacuationRecords.map((e: any) => {
              const boxes = parseCargoNumber(e.auxCargo)
              return (
                <div key={e.id} className="evacuation-item" style={{background: getColor(isDarkMode, '#fefce8', '#1a1f2e'), border: `1px solid ${getColor(isDarkMode, '#e2e8f0', '#2d3a5e')}`, padding:'8px 12px', borderRadius:'10px', marginBottom:'4px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'4px'}}>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'4px 12px',fontSize:'0.75rem',color: getColor(isDarkMode, '#1e293b', '#e2e8f0')}}>
                    <strong>{e.containerNumber}</strong>
                    <span style={{color: getColor(isDarkMode, '#64748b', '#94a3b8')}}>{e.position}</span>
                    <span style={{color: getColor(isDarkMode, '#64748b', '#94a3b8')}}>{e.equipment}</span>
                    <span style={{color:'#f59e0b'}}>📦 {boxes}</span>
                    <span style={{fontSize:'0.6rem',color: getColor(isDarkMode, '#64748b', '#94a3b8')}}>{formatDate(e.evacuatedAt)}</span>
                  </div>
                  <button className="btn-warning btn-sm" onClick={() => removeFromEvacuation(e.containerNumber)} style={{background:'#f59e0b',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer'}}>↩️ Return</button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
