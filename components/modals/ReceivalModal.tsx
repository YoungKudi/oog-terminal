"use client"
import React, { useState, useRef } from 'react'
import { EQUIPMENT_LIST, AUX_CARGO_TYPES } from '@/lib/constants'
import { getColor } from '@/lib/utils'

interface ReceivalModalProps {
  onClose: () => void
  onSave: () => void
  isDarkMode: boolean
  allPositions: string[]
  showToast: (msg: string) => void
}

export default function ReceivalModal({ onClose, onSave, isDarkMode, allPositions, showToast }: ReceivalModalProps) {
  const [containerNumber, setContainerNumber] = useState('')
  const [position, setPosition] = useState('')
  const [size, setSize] = useState('40')
  const [type, setType] = useState('')
  const [equipment, setEquipment] = useState('')
  const [auxCargoQty, setAuxCargoQty] = useState(0)
  const [auxCargoType, setAuxCargoType] = useState('units')
  const [remarks, setRemarks] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const sortedPositions = [...allPositions].sort((a, b) => {
    if (a.startsWith('L') && !b.startsWith('L')) return -1
    if (!a.startsWith('L') && b.startsWith('L')) return 1
    if (a.startsWith('R') && !b.startsWith('R') && !a.startsWith('L')) return -1
    if (!a.startsWith('R') && b.startsWith('R') && !a.startsWith('L')) return 1
    if (a === 'M') return 1
    if (b === 'M') return -1
    const numA = parseInt(a.match(/\d+/)?.[0] || '0')
    const numB = parseInt(b.match(/\d+/)?.[0] || '0')
    return numA - numB
  })

  const handleContainerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow letters and numbers, preserve case
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '')
    setContainerNumber(cleaned)
  }

  const handleSubmit = async () => {
    const upperContainerNumber = containerNumber.toUpperCase()
    if (!upperContainerNumber || !position || !size || !type || !equipment) {
      showToast('❌ Please fill all required fields')
      return
    }
    const regex = /^[A-Z]{4}\d{7}$/
    if (!regex.test(upperContainerNumber)) {
      showToast('❌ Invalid container number. Use 4 letters + 7 digits')
      return
    }
    setLoading(true)
    try {
      const auxCargo = auxCargoQty > 0 ? `${auxCargoQty} ${auxCargoType}` : ''
      const res = await fetch('/api/containers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          containerNumber: upperContainerNumber,
          position, size, type, equipment,
          auxCargo, auxCargoType, auxCargoQuantity: auxCargoQty,
          remarks
        })
      })
      if (res.ok) {
        showToast('✅ Container added')
        onSave()
        onClose()
      } else {
        const data = await res.json()
        showToast('❌ ' + (data.error || 'Failed to add container'))
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

  return (
    <div className="modal" style={{display:'flex', position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', justifyContent:'center', alignItems:'center', zIndex:1000}}>
      <div className="modal-content" style={{background: bgColor, color: textColor, borderRadius:'24px', padding:'18px', maxWidth:'440px', width:'92%', maxHeight:'80vh', overflowY:'auto', border: `1px solid ${borderColor}`}}>
        <h3 style={{color: textColor, marginBottom:'10px'}}>📦 New Container</h3>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Container Number (4 letters + 7 digits)</label>
          <input 
            ref={inputRef}
            type="text" 
            value={containerNumber} 
            onChange={handleContainerChange}
            placeholder="e.g., MAEU1234567" 
            style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} 
          />
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.55rem', color: mutedColor, marginTop:'4px'}}>
            <span>{containerNumber.length > 0 ? `${containerNumber.length}/11 characters` : ''}</span>
            <span>{containerNumber ? containerNumber.toUpperCase() : ''}</span>
          </div>
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Position</label>
          <select value={position} onChange={(e) => setPosition(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}}>
            <option value="">Select Position</option>
            {sortedPositions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
          <div className="form-group" style={{marginBottom:'8px'}}>
            <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Size</label>
            <select value={size} onChange={(e) => setSize(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}}>
              <option value="40">40ft</option>
              <option value="20">20ft</option>
            </select>
          </div>
          <div className="form-group" style={{marginBottom:'8px'}}>
            <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}}>
              <option value="">Select</option>
              <option value="FR">Flat Rack</option>
              <option value="OT">Open Top</option>
            </select>
          </div>
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Equipment</label>
          <select value={equipment} onChange={(e) => setEquipment(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}}>
            <option value="">Select Equipment</option>
            {EQUIPMENT_LIST.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'8px'}}>
          <div className="form-group" style={{marginBottom:'8px'}}>
            <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Aux Cargo Qty</label>
            <input type="number" value={auxCargoQty} onChange={(e) => setAuxCargoQty(parseInt(e.target.value) || 0)} min="0" style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} />
          </div>
          <div className="form-group" style={{marginBottom:'8px'}}>
            <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Type</label>
            <select value={auxCargoType} onChange={(e) => setAuxCargoType(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}}>
              {AUX_CARGO_TYPES.map(t => <option key={t} value={t.toLowerCase()}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Remarks</label>
          <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} />
        </div>
        <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{background:'#1e6f3f',color:'white',border:'none',borderRadius:'40px',padding:'5px 12px',fontWeight:'600',fontSize:'0.7rem',cursor: loading ? 'not-allowed' : 'pointer', flex:1}}>
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
