'use client'
import React, { useState } from 'react'
import { getColor } from '@/lib/utils'

interface RepositionModalProps {
  onClose: () => void
  onSave: () => void
  isDarkMode: boolean
  container: any
  allPositions: string[]
  showToast: (msg: string) => void
}

export default function RepositionModal({ onClose, onSave, isDarkMode, container, allPositions, showToast }: RepositionModalProps) {
  const [newPosition, setNewPosition] = useState(container?.position || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!container || !newPosition) return
    if (newPosition === container.position) {
      showToast('❌ Position unchanged')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/containers/' + container.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...container, position: newPosition })
      })
      if (res.ok) {
        showToast('✅ Moved to ' + newPosition)
        onSave()
        onClose()
      } else {
        showToast('❌ Failed to move')
      }
    } catch (err) {
      showToast('❌ Network error')
    }
    setLoading(false)
  }

  return (
    <div className="modal" style={{display:'flex', position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', justifyContent:'center', alignItems:'center', zIndex:1000}}>
      <div className="modal-content" style={{background: getColor(isDarkMode, 'white', '#1e293b'), color: getColor(isDarkMode, "#1e293b", "#e2e8f0")}}>
        <h3 style={{color: getColor(isDarkMode, "#1e293b", "#e2e8f0"), marginBottom:'10px'}}>📍 Move Container</h3>
        <div style={{marginBottom:'10px', fontSize:'0.8rem', fontWeight:'600', color: getColor(isDarkMode, "#1e293b", "#e2e8f0")}}>
          {container?.containerNumber}<br />
          <span style={{fontSize:'0.7rem', fontWeight:'normal', color: getColor(isDarkMode, "#1e293b", "#e2e8f0")}}>Current: {container?.position}</span>
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: getColor(isDarkMode, "#1e293b", "#e2e8f0"), fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>New Position</label>
          <select value={newPosition} onChange={(e) => setNewPosition(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: getColor(isDarkMode, 'white', '#0a0e17'), color: getColor(isDarkMode, "#1e293b", "#e2e8f0")}}>
            {allPositions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{background:'#1e6f3f',color:'white',border:'none',borderRadius:'40px',padding:'5px 12px',fontWeight:'600',fontSize:'0.7rem',cursor: loading ? 'not-allowed' : 'pointer', flex:1}}>
            {loading ? 'Moving...' : 'Confirm'}
          </button>
          <button className="btn btn-outline" onClick={onClose} style={{background:'white',border:'1.5px solid #cbd5e1',borderRadius:'40px',padding:'5px 12px',fontWeight:'600',fontSize:'0.7rem',cursor:'pointer'}}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
