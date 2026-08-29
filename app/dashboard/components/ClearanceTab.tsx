"use client"
import React, { useState } from 'react'
import { getColor } from '@/lib/utils'
import { AUX_CARGO_TYPES } from '@/lib/constants'

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
  const [processing, setProcessing] = useState(false)
  const [truckPlate, setTruckPlate] = useState('')
  const [remarks, setRemarks] = useState('')

  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#64748b', '#94a3b8')
  const cardBg = getColor(isDarkMode, 'white', '#111827')
  const borderColor = getColor(isDarkMode, '#eef2f6', '#1f2937')
  const inputBg = getColor(isDarkMode, 'white', '#0a0e17')
  const inputText = getColor(isDarkMode, '#1e293b', '#e2e8f0')

  const handleClearance = async () => {
    if (!truckPlate) {
      showToast('❌ Please enter truck plate number')
      return
    }

    if (clearanceContainers.length === 0) {
      showToast('❌ No containers to clear')
      return
    }

    setProcessing(true)
    let successCount = 0

    try {
      for (const container of clearanceContainers) {
        const today = new Date().toISOString().slice(0, 10)
        const data = {
          containerNumber: container.containerNumber,
          size: container.size,
          type: container.type,
          equipment: container.equipment,
          vessel: container.vessel || '',
          arrivalDate: container.arrivalDate || '',
          unstuffedDate: container.unstuffedAt || today,
          deliveryDate: today,
          location: container.position,
          content: container.equipment,
          truckPlate,
          agentContact: container.agency || '',
          boxesLoaded: container.auxCargoQuantity || 0,
          devanningType: container.devanningType || 'unstuffing',
          remarks: remarks || ''
        }

        const res = await fetch('/api/loadout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })

        if (res.ok) {
          successCount++
          await fetch('/api/unstuffed', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ containerNumber: container.containerNumber })
          })
        }
      }

      if (successCount > 0) {
        showToast(`✅ ${successCount} container(s) cleared successfully`)
        setClearanceContainers([])
        setTruckPlate('')
        setRemarks('')
        fetchAllData()
        onBack()
      } else {
        showToast('❌ Failed to clear containers')
      }
    } catch (error) {
      showToast('❌ Network error')
    }

    setProcessing(false)
  }

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
          <>
            {/* Clearance Form */}
            <div style={{marginBottom:'16px', padding:'12px', background: getColor(isDarkMode, '#f1f5f9', '#0f172a'), borderRadius:'8px'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
                <div className="form-group" style={{marginBottom:'8px'}}>
                  <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Truck Plate *</label>
                  <input 
                    type="text" 
                    value={truckPlate} 
                    onChange={(e) => setTruckPlate(e.target.value.toUpperCase())}
                    placeholder="e.g., GT-1234-24"
                    style={{padding:'6px 8px',borderRadius:'8px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}}
                  />
                </div>
                <div className="form-group" style={{marginBottom:'8px'}}>
                  <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Remarks</label>
                  <input 
                    type="text" 
                    value={remarks} 
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Optional notes"
                    style={{padding:'6px 8px',borderRadius:'8px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}}
                  />
                </div>
              </div>
              <button 
                className="btn-primary btn-sm" 
                onClick={handleClearance}
                disabled={processing || !truckPlate || clearanceContainers.length === 0}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  background: (processing || !truckPlate || clearanceContainers.length === 0) ? '#6c757d' : '#1e6f3f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '40px',
                  padding: '6px 12px',
                  fontWeight: '600',
                  fontSize: '0.7rem',
                  cursor: (processing || !truckPlate || clearanceContainers.length === 0) ? 'not-allowed' : 'pointer'
                }}
              >
                {processing ? 'Processing...' : `✅ Clear ${clearanceContainers.length} Container(s)`}
              </button>
            </div>

            {/* Clearance List */}
            <div style={{maxHeight:'300px', overflowY:'auto'}}>
              {clearanceContainers.map((c: any) => {
                const auxCargo = c.auxCargo || ''
                const cargoMatch = auxCargo.match(/(\d+)\s*(\w+)/)
                const cargoQty = cargoMatch ? parseInt(cargoMatch[1]) : 0
                const cargoType = cargoMatch ? cargoMatch[2] : 'units'
                const units = c.isDouble ? 2 : 1

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
          </>
        )}
      </div>
    </div>
  )
}
