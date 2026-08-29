"use client"
import React, { useState, useEffect } from 'react'
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
  const [equipmentList, setEquipmentList] = useState<string[]>(EQUIPMENT_LIST)
  const [showNewEquipment, setShowNewEquipment] = useState(false)
  const [newEquipment, setNewEquipment] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('oog_custom_equipment')
    if (saved) {
      const customList = JSON.parse(saved)
      const merged = [...EQUIPMENT_LIST, ...customList]
      const unique = [...new Set(merged)]
      setEquipmentList(unique)
    }
  }, [])

  const handleAddEquipment = () => {
    if (!newEquipment.trim()) {
      showToast('❌ Please enter equipment name')
      return
    }
    
    const trimmed = newEquipment.trim()
    if (equipmentList.includes(trimmed)) {
      showToast('❌ Equipment already exists')
      return
    }
    
    const updatedList = [...equipmentList, trimmed]
    setEquipmentList(updatedList)
    setEquipment(trimmed)
    
    const customItems = updatedList.filter(item => !EQUIPMENT_LIST.includes(item))
    localStorage.setItem('oog_custom_equipment', JSON.stringify(customItems))
    
    setShowNewEquipment(false)
    setNewEquipment('')
    showToast(`✅ "${trimmed}" added to equipment list`)
  }

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

  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#4b5563', '#94a3b8')
  const bgColor = getColor(isDarkMode, 'white', '#1e293b')
  const borderColor = getColor(isDarkMode, '#eef2f6', '#334155')
  const inputBg = getColor(isDarkMode, 'white', '#0a0e17')
  const inputText = getColor(isDarkMode, '#1e293b', '#e2e8f0')

  return (
    <div className="modal" style={{display:'flex', position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', justifyContent:'center', alignItems:'center', zIndex:1000}}>
      <div className="modal-content" style={{background: bgColor, color: textColor, borderRadius:'24px', padding:'18px', maxWidth:'440px', width:'92%', maxHeight:'80vh', overflowY:'auto', border: `1px solid ${borderColor}`}}>
        <h3 style={{color: textColor, marginBottom:'10px'}}>✏️ Edit Container</h3>
        <div style={{marginBottom:'10px', fontSize:'0.8rem', fontWeight:'600', color: textColor}}>
          Editing: {container?.containerNumber}
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Position</label>
          <select value={position} onChange={(e) => setPosition(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}}>
            {allPositions.map(p => <option key={p} value={p}>{p}</option>)}
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
              <option value="FR">Flat Rack</option>
              <option value="OT">Open Top</option>
            </select>
          </div>
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Equipment</label>
          <div style={{display:'flex', gap:'6px'}}>
            <select value={equipment} onChange={(e) => setEquipment(e.target.value)} style={{flex:1, padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}}>
              <option value="">Select Equipment</option>
              {equipmentList.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <button 
              type="button"
              onClick={() => setShowNewEquipment(!showNewEquipment)}
              style={{
                padding:'4px 10px',
                borderRadius:'10px',
                border:'1px solid #cfdfed',
                background: '#1e6f3f',
                color: 'white',
                fontSize:'0.7rem',
                cursor:'pointer',
                whiteSpace:'nowrap'
              }}
            >
              +
            </button>
          </div>
        </div>
        
        {showNewEquipment && (
          <div style={{marginBottom:'8px', padding:'8px', background: getColor(isDarkMode, '#f1f5f9', '#0f172a'), borderRadius:'8px'}}>
            <div style={{display:'flex', gap:'6px'}}>
              <input 
                type="text" 
                value={newEquipment} 
                onChange={(e) => setNewEquipment(e.target.value)}
                placeholder="Enter new equipment type"
                style={{flex:1, padding:'6px 8px',borderRadius:'8px',border:'1px solid #cfdfed',fontSize:'0.75rem',background: inputBg, color: inputText}}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddEquipment()
                  }
                }}
              />
              <button 
                type="button"
                onClick={handleAddEquipment}
                style={{
                  padding:'4px 12px',
                  borderRadius:'8px',
                  border:'none',
                  background: '#10b981',
                  color: 'white',
                  fontSize:'0.7rem',
                  cursor:'pointer'
                }}
              >
                Add
              </button>
              <button 
                type="button"
                onClick={() => { setShowNewEquipment(false); setNewEquipment('') }}
                style={{
                  padding:'4px 10px',
                  borderRadius:'8px',
                  border:'none',
                  background: '#dc2626',
                  color: 'white',
                  fontSize:'0.7rem',
                  cursor:'pointer'
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Aux Cargo</label>
          <input type="text" value={auxCargo} onChange={(e) => setAuxCargo(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} />
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Remarks</label>
          <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} />
        </div>
        <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{background:'#1e6f3f',color:'white',border:'none',borderRadius:'40px',padding:'5px 12px',fontWeight:'600',fontSize:'0.7rem',cursor: loading ? 'not-allowed' : 'pointer', flex:1}}>
            {loading ? 'Saving...' : '💾 Save'}
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
