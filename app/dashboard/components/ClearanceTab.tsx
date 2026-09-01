"use client"
import React from 'react'
import { getColor } from '@/lib/utils'

interface ClearanceTabProps {
  clearanceContainers: any[]
  setClearanceContainers: (containers: any[]) => void
  isDarkMode: boolean
  showToast: (msg: string) => void
  fetchAllData: () => void
  onBack: () => void
}

export default function ClearanceTab({
  clearanceContainers,
  setClearanceContainers,
  isDarkMode,
  showToast,
  fetchAllData,
  onBack
}: ClearanceTabProps) {
  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#64748b', '#94a3b8')
  const cardBg = getColor(isDarkMode, 'white', '#111827')
  const borderColor = getColor(isDarkMode, '#eef2f6', '#1f2937')

  const removeFromClearance = (containerNumber: string) => {
    const updated = clearanceContainers.filter(c => c.containerNumber !== containerNumber)
    setClearanceContainers(updated)
    showToast(`🗑️ Removed ${containerNumber} from clearance`)
  }

  const handleClearAll = () => {
    if (clearanceContainers.length === 0) return
    if (confirm('Remove all containers from clearance list?')) {
      setClearanceContainers([])
      showToast('🗑️ Cleared all')
    }
  }

  return (
    <div className="card" style={{background: cardBg, borderRadius:'16px', marginBottom:'14px', border: `1px solid ${borderColor}`}}>
      <div className="list-header" style={{background: getColor(isDarkMode, '#fefce8', '#0f172a'), borderRadius:'16px 16px 0 0', padding:'8px 14px', borderBottom: `2px solid ${getColor(isDarkMode, '#eab308', '#8b5cf6')}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'6px', color: getColor(isDarkMode, '#1e293b', '#f1f5f9')}}>
        <span>📋 Clearance Queue ({clearanceContainers.length} containers)</span>
        <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
          <button className="btn-danger btn-sm" onClick={handleClearAll} style={{background:'#dc2626',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer'}}>
            🗑️ Clear All
          </button>
          <button className="btn-outline btn-sm" onClick={onBack} style={{
            background: getColor(isDarkMode, 'white', '#1e293b'),
            border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`,
            borderRadius: '40px',
            padding: '2px 8px',
            fontWeight: '600',
            fontSize: '0.6rem',
            cursor: 'pointer',
            color: getColor(isDarkMode, '#1e293b', '#e2e8f0')
          }}>
            ← Back to Unstuffed
          </button>
        </div>
      </div>
      <div className="card-body" style={{padding:'10px 14px'}}>
        {clearanceContainers.length === 0 ? (
          <div style={{padding:'16px',textAlign:'center',color:mutedColor,fontSize:'0.75rem'}}>
            📭 No containers in clearance queue
            <br />
            <span style={{fontSize:'0.6rem'}}>Click "Load" on unstuffed containers to add them here</span>
          </div>
        ) : (
          <div style={{maxHeight:'400px', overflowY:'auto'}}>
            {clearanceContainers.map((c: any) => {
              const auxCargo = c.auxCargo || ''
              const cargoMatch = auxCargo.match(/(\d+)\s*(\w+)/)
              const cargoQty = cargoMatch ? parseInt(cargoMatch[1]) : 0
              const cargoType = cargoMatch ? cargoMatch[2] : 'units'

              return (
                <div 
                  key={c.id} 
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    marginBottom: '4px',
                    background: getColor(isDarkMode, '#ffffff', '#1a1f2e'),
                    borderRadius: '8px',
                    border: `1px solid ${borderColor}`
                  }}
                >
                  <div>
                    <span style={{fontWeight:'600', fontSize:'0.8rem', color: textColor}}>{c.containerNumber}</span>
                    <span style={{fontSize:'0.6rem', color: mutedColor, marginLeft:'8px'}}>{c.equipment}</span>
                    {c.isDouble && <span style={{fontSize:'0.55rem',color:'#f59e0b',fontWeight:'600',marginLeft:'4px'}}>2X</span>}
                    <div style={{fontSize:'0.65rem', color: mutedColor}}>
                      📦 {cargoQty} {cargoType} | {c.position}
                    </div>
                  </div>
                  <button 
                    className="btn-danger btn-sm" 
                    onClick={() => removeFromClearance(c.containerNumber)}
                    style={{
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '40px',
                      padding: '2px 8px',
                      fontWeight: '600',
                      fontSize: '0.6rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
