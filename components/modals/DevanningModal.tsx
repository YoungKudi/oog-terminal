import React from "react"
import React from "react"
"use client"
import React, { useState, useEffect, useRef } from 'react'
import { getColor } from '@/lib/utils'

interface DevanningModalProps {
  onClose: () => void
  onSave: () => void
  isDarkMode: boolean
  containers: any[]
  allPositions: string[]
  showToast: (msg: string) => void
}

export default function DevanningModal({ onClose, onSave, isDarkMode, containers, allPositions, showToast }: DevanningModalProps) {
  const [containerNumber, setContainerNumber] = useState('')
  const [devType, setDevType] = useState('')
  const [vessel, setVessel] = useState('')
  const [arrivalDate, setArrivalDate] = useState('')
  const [agency, setAgency] = useState('')
  const [remarks, setRemarks] = useState('')
  const [container, setContainer] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const num = containerNumber.toUpperCase().trim()
    if (num) {
      const found = containers.find(c => c.containerNumber === num)
      setContainer(found || null)
    } else {
      setContainer(null)
    }
  }, [containerNumber, containers])

  const handleContainerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow letters and numbers, preserve case
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '')
    setContainerNumber(cleaned)
  }

  const isExcavator = container?.equipment === 'Excavator' || container?.equipment === '2x Excavator'

  const handleSubmit = async () => {
    const upperContainerNumber = containerNumber.toUpperCase()
    if (!upperContainerNumber || !devType) {
      showToast('❌ Please fill required fields')
      return
    }
    
    if (!container) {
      showToast('❌ Container not in stack. Please check the container number.')
      return
    }
    
    if (isExcavator) {
      if (!vessel) { showToast('❌ Vessel name required for ' + container.equipment); return }
      if (!arrivalDate) { showToast('❌ Arrival date required for ' + container.equipment); return }
    }
    
    setLoading(true)
    try {
      const res = await fetch('/api/devanning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          containerNumber: upperContainerNumber,
          containerId: container.id,
          position: container.position,
          size: container.size,
          type: container.type,
          equipment: container.equipment,
          auxCargo: container.auxCargo || '',
          auxCargoType: container.auxCargoType || 'units',
          auxCargoQuantity: container.auxCargoQuantity || 0,
          vessel,
          arrivalDate,
          devanningType: devType,
          agency,
          remarks
        })
      })
      if (res.ok) {
        showToast('🚢 Moved to devanning')
        onSave()
        onClose()
      } else {
        const data = await res.json()
        showToast('❌ ' + (data.error || 'Failed to move to devanning'))
      }
    } catch (err) {
      showToast('❌ Network error')
    }
    setLoading(false)
  }

  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#4b5563', '#94a3b8')
  const bgColor = getColor(isDarkMode, 'white', '#1e293b')
  const borderColor = getColor(isDarkMode, '#eef2f6', '#334155')
  const inputBg = getColor(isDarkMode, 'white', '#0a0e17')
  const inputText = getColor(isDarkMode, '#1e293b', '#e2e8f0')

  const containerInfo = container

  return (
    <div className="modal" style={{display:'flex', position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', justifyContent:'center', alignItems:'center', zIndex:1000}}>
      <div className="modal-content" style={{background: bgColor, color: textColor, borderRadius:'24px', padding:'18px', maxWidth:'440px', width:'92%', maxHeight:'80vh', overflowY:'auto', border: `1px solid ${borderColor}`}}>
        <h3 style={{color: textColor, marginBottom:'10px'}}>🏗️ Move to Devanning</h3>
        
        {containerInfo && (
          <div style={{marginBottom:'12px', padding:'8px 12px', background: getColor(isDarkMode, '#f0fdf4', '#0f172a'), borderRadius:'8px', border: `1px solid ${getColor(isDarkMode, '#86efac', '#1e293b')}`}}>
            <div style={{fontSize:'0.7rem', fontWeight:'600', color: getColor(isDarkMode, '#166534', '#86efac')}}>
              ✅ Container found in stack
            </div>
            <div style={{fontSize:'0.65rem', color: mutedColor, marginTop:'4px'}}>
              {containerInfo.containerNumber} | {containerInfo.position} | {containerInfo.equipment}
            </div>
          </div>
        )}
        
        {!containerInfo && containerNumber && (
          <div style={{marginBottom:'12px', padding:'8px 12px', background: getColor(isDarkMode, '#fef2f2', '#1a1a2e'), borderRadius:'8px', border: `1px solid ${getColor(isDarkMode, '#fca5a5', '#7f1d1d')}`}}>
            <div style={{fontSize:'0.7rem', fontWeight:'600', color: getColor(isDarkMode, '#dc2626', '#fca5a5')}}>
              ❌ Container not found in stack
            </div>
            <div style={{fontSize:'0.65rem', color: mutedColor, marginTop:'4px'}}>
              Please check the container number
            </div>
          </div>
        )}
        
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Container Number</label>
          <input 
            ref={inputRef}
            type="text" 
            value={containerNumber} 
            onChange={handleContainerChange}
            placeholder="Enter container number" 
            style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} 
          />
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.55rem', color: mutedColor, marginTop:'4px'}}>
            <span>{containerNumber.length > 0 ? `${containerNumber.length}/11 characters` : ''}</span>
            <span>{containerNumber ? containerNumber.toUpperCase() : ''}</span>
          </div>
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Devanning Type</label>
          <select value={devType} onChange={(e) => setDevType(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}}>
            <option value="">Select</option>
            <option value="unstuffing">Unstuffing</option>
            <option value="house_house">House/House</option>
            <option value="transit">Transit</option>
            <option value="freezone">Freezone</option>
            <option value="re_export">Re-Export</option>
            <option value="back_to_port">Back To Port</option>
          </select>
        </div>
        {isExcavator && (
          <div style={{borderTop:`1px solid ${borderColor}`,paddingTop:'10px',marginTop:'8px'}}>
            <div style={{fontWeight:600,fontSize:'0.8rem',color:'#f59e0b',marginBottom:'6px'}}>🚜 Excavator Details</div>
            <div className="form-group" style={{marginBottom:'8px'}}>
              <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Vessel Name *</label>
              <input type="text" value={vessel} onChange={(e) => setVessel(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} />
            </div>
            <div className="form-group" style={{marginBottom:'8px'}}>
              <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Arrival Date *</label>
              <input type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} />
            </div>
          </div>
        )}
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Agency</label>
          <input type="text" value={agency} onChange={(e) => setAgency(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} />
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Remarks</label>
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}}></textarea>
        </div>
        <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
          <button className="btn btn-success" onClick={handleSubmit} disabled={loading || !container} style={{
            background: (!container) ? '#6c757d' : '#10b981',
            color: 'white', 
            border: 'none', 
            borderRadius: '40px', 
            padding: '5px 12px', 
            fontWeight: '600', 
            fontSize: '0.7rem', 
            cursor: (loading || !container) ? 'not-allowed' : 'pointer', 
            flex: 1,
            opacity: (loading || !container) ? 0.6 : 1
          }}>
            {loading ? 'Adding...' : '✅ Add'}
          </button>
          <button className="btn btn-outline" onClick={onClose} style={{
            background: getColor(isDarkMode, 'white', '#1e293b'),
            border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`,
            borderRadius: '40px',
            padding: '5px 12px',
            fontWeight: '600',
            fontSize: '0.7rem',
            cursor: 'pointer',
            color: getColor(isDarkMode, '#1e293b', '#e2e8f0')
          }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
