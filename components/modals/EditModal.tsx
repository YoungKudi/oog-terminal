import React from "react"
import React from "react"
'use client'
import React, { useState } from 'react'
import { EQUIPMENT_LIST } from '@/lib/constants'
import { getColor } from '@/lib/utils'

interface EditModalProps {
  onClose: () => void
  onSave: () => void
  isDarkMode: boolean
  container: any
  containers: any[]
  allPositions: string[]
  showToast: (msg: string) => void
}

export default function EditModal({ onClose, onSave, isDarkMode, container, containers, allPositions, showToast }: EditModalProps) {
  const [position, setPosition] = useState(container?.position || '')
  const [size, setSize] = useState(container?.size || '40')
  const [type, setType] = useState(container?.type || 'FR')
  const [equipment, setEquipment] = useState(container?.equipment || '')
  const [auxCargo, setAuxCargo] = useState(container?.auxCargo || '')
  const [remarks, setRemarks] = useState(container?.remarks || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!container) return
    setLoading(true)
    try {
      const res = await fetch('/api/containers/' + container.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position, size, type, equipment, auxCargo, remarks })
      })
      if (res.ok) {
        showToast('✅ Updated')
        onSave()
        onClose()
      } else {
        showToast('❌ Failed to update')
      }
    } catch (err) {
      showToast('❌ Network error')
    }
    setLoading(false)
  }

  return (
    <div className="modal" style={{display:'flex', position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', justifyContent:'center', alignItems:'center', zIndex:1000}}>
      <div className="modal-content" style={{background: getColor(isDarkMode, 'white', '#1e293b'), color: getColor(isDarkMode, "#1e293b", "#e2e8f0")}}>
        <h3 style={{color: getColor(isDarkMode, "#1e293b", "#e2e8f0"), marginBottom:'10px'}}>✏️ Edit Container</h3>
        <div style={{marginBottom:'10px', fontSize:'0.8rem', fontWeight:'600', color: getColor(isDarkMode, "#1e293b", "#e2e8f0")}}>
          Editing: {container?.containerNumber}
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: getColor(isDarkMode, "#1e293b", "#e2e8f0"), fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Position</label>
          <select value={position} onChange={(e) => setPosition(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: getColor(isDarkMode, 'white', '#0a0e17'), color: getColor(isDarkMode, "#1e293b", "#e2e8f0")}}>
            {allPositions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
          <div className="form-group" style={{marginBottom:'8px'}}>
            <label style={{color: getColor(isDarkMode, "#1e293b", "#e2e8f0"), fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Size</label>
            <select value={size} onChange={(e) => setSize(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: getColor(isDarkMode, 'white', '#0a0e17'), color: getColor(isDarkMode, "#1e293b", "#e2e8f0")}}>
              <option value="40">40ft</option>
              <option value="20">20ft</option>
            </select>
          </div>
          <div className="form-group" style={{marginBottom:'8px'}}>
            <label style={{color: getColor(isDarkMode, "#1e293b", "#e2e8f0"), fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: getColor(isDarkMode, 'white', '#0a0e17'), color: getColor(isDarkMode, "#1e293b", "#e2e8f0")}}>
              <option value="FR">Flat Rack</option>
              <option value="OT">Open Top</option>
            </select>
          </div>
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: getColor(isDarkMode, "#1e293b", "#e2e8f0"), fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Equipment</label>
          <select value={equipment} onChange={(e) => setEquipment(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: getColor(isDarkMode, 'white', '#0a0e17'), color: getColor(isDarkMode, "#1e293b", "#e2e8f0")}}>
            {EQUIPMENT_LIST.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: getColor(isDarkMode, "#1e293b", "#e2e8f0"), fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Aux Cargo</label>
          <input type="text" value={auxCargo} onChange={(e) => setAuxCargo(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: getColor(isDarkMode, 'white', '#0a0e17'), color: getColor(isDarkMode, "#1e293b", "#e2e8f0")}} />
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: getColor(isDarkMode, "#1e293b", "#e2e8f0"), fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Remarks</label>
          <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: getColor(isDarkMode, 'white', '#0a0e17'), color: getColor(isDarkMode, "#1e293b", "#e2e8f0")}} />
        </div>
        <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{background:'#1e6f3f',color:'white',border:'none',borderRadius:'40px',padding:'5px 12px',fontWeight:'600',fontSize:'0.7rem',cursor: loading ? 'not-allowed' : 'pointer', flex:1}}>
            {loading ? 'Saving...' : '💾 Save'}
          </button>
          <button className="btn btn-outline" onClick={onClose} style={{background:'white',border:'1.5px solid #cbd5e1',borderRadius:'40px',padding:'5px 12px',fontWeight:'600',fontSize:'0.7rem',cursor:'pointer'}}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
