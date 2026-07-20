"use client"
import React, { useState } from 'react'
import { getColor, parseCargoNumber } from '@/lib/utils'

interface LoadoutModalProps {
  onClose: () => void
  onSave: () => void
  isDarkMode: boolean
  container: any
  unstuffedContainers: any[]
  showToast: (msg: string) => void
}

export default function LoadoutModal({ onClose, onSave, isDarkMode, container, unstuffedContainers, showToast }: LoadoutModalProps) {
  const [truckPlate, setTruckPlate] = useState('')
  const [agentContact, setAgentContact] = useState('')
  const [boxesLoaded, setBoxesLoaded] = useState(0)
  const [remarks, setRemarks] = useState('')
  const [loading, setLoading] = useState(false)

  const containerData = unstuffedContainers.find(u => u.containerNumber === container?.containerNumber)
  const isExcavator = containerData?.equipment === 'Excavator' || containerData?.equipment === '2x Excavator'
  const today = new Date().toISOString().slice(0,10)

  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#4b5563', '#94a3b8')
  const bgColor = getColor(isDarkMode, 'white', '#1e293b')
  const borderColor = getColor(isDarkMode, '#eef2f6', '#334155')
  const inputBg = getColor(isDarkMode, 'white', '#0a0e17')
  const inputText = getColor(isDarkMode, '#1e293b', '#e2e8f0')

  const handleSubmit = async () => {
    if (!truckPlate) {
      showToast('❌ Truck plate required')
      return
    }
    if (!containerData) {
      showToast('❌ Container data not found')
      return
    }
    
    setLoading(true)
    try {
      // Format dates properly - use null if empty
      const unstuffedDate = containerData.unstuffedAt || today
      const deliveryDate = today
      
      const data = {
        containerNumber: containerData.containerNumber,
        size: containerData.size,
        type: containerData.type,
        equipment: containerData.equipment,
        vessel: containerData.vessel || '',
        arrivalDate: containerData.arrivalDate || '',
        unstuffedDate: unstuffedDate,
        deliveryDate: deliveryDate,
        location: containerData.position,
        content: containerData.equipment,
        truckPlate,
        agentContact: agentContact || '',
        boxesLoaded: boxesLoaded || 0,
        devanningType: containerData.devanningType || 'unstuffing',
        remarks: remarks || ''
      }
      
      const res = await fetch('/api/loadout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        showToast('✅ Cleared')
        onSave()
        onClose()
      } else {
        const errData = await res.json()
        showToast('❌ Failed to clear: ' + (errData.error || 'Unknown error'))
      }
    } catch (err) {
      showToast('❌ Network error')
    }
    setLoading(false)
  }

  return (
    <div className="modal" style={{display:'flex', position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', justifyContent:'center', alignItems:'center', zIndex:1000}}>
      <div className="modal-content" style={{background: bgColor, color: textColor, borderRadius:'24px', padding:'18px', maxWidth:'440px', width:'92%', maxHeight:'80vh', overflowY:'auto', border: `1px solid ${borderColor}`}}>
        <h3 style={{color: textColor, marginBottom:'10px'}}>📋 Loadout & Clearance</h3>
        <div style={{marginBottom:'10px', fontSize:'0.8rem', fontWeight:'600', color: textColor}}>
          Container: {containerData?.containerNumber}
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Truck Plate *</label>
          <input type="text" value={truckPlate} onChange={(e) => setTruckPlate(e.target.value)} placeholder="Required" style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} />
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Agent Contact</label>
          <input type="text" value={agentContact} onChange={(e) => setAgentContact(e.target.value)} placeholder="Agent name or phone" style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} />
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Boxes Loaded</label>
          <input type="number" value={boxesLoaded} onChange={(e) => setBoxesLoaded(parseInt(e.target.value) || 0)} min="0" style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} />
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Remarks</label>
          <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Additional notes" style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} />
        </div>
        <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{background:'#1e6f3f',color:'white',border:'none',borderRadius:'40px',padding:'5px 12px',fontWeight:'600',fontSize:'0.7rem',cursor: loading ? 'not-allowed' : 'pointer', flex:1}}>
            {loading ? 'Processing...' : '✅ Register'}
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
