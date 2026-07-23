import React from "react"
import React from "react"
"use client"
import React, { useState } from 'react'
import { getColor } from '@/lib/utils'

interface AddLocationModalProps {
  onClose: () => void
  onSave: () => void
  isDarkMode: boolean
  locations: any[]
  setLocations: (locs: any[]) => void
  showToast: (msg: string) => void
}

export default function AddLocationModal({ onClose, onSave, isDarkMode, locations, setLocations, showToast }: AddLocationModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState('grid')
  const [cols, setCols] = useState(2)
  const [rows, setRows] = useState(11)
  const [prefix, setPrefix] = useState('J')
  const [positions, setPositions] = useState(5)
  const [rowPrefix, setRowPrefix] = useState('WG')
  const [loading, setLoading] = useState(false)

  const generateGridPositions = (prefix: string, cols: number, rows: number) => {
    const positions = []
    if (cols === 2) {
      for (let i = 1; i <= rows; i++) { positions.push(`L${i}`); }
      for (let i = 1; i <= rows; i++) { positions.push(`R${i}`); }
      positions.push('M')
    } else if (cols === 1) {
      for (let i = 1; i <= rows; i++) positions.push(`${prefix}${i}`)
    } else {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      for (let r = 1; r <= rows; r++) for (let c = 0; c < cols; c++) positions.push(`${prefix}${letters[c]}${r}`)
    }
    return positions
  }

  const generateRowPositions = (prefix: string, count: number) => {
    const positions = []
    for (let i = 1; i <= count; i++) positions.push(`${prefix}${i}`)
    return positions
  }

  const handleSubmit = () => {
    if (!name) {
      showToast('❌ Please enter a location name')
      return
    }
    if (locations.find(l => l.name.toLowerCase() === name.toLowerCase())) {
      showToast('❌ Location "' + name + '" already exists')
      return
    }
    
    let newPositions: string[] = []
    if (type === 'grid') {
      if (!prefix) { showToast('❌ Please enter a prefix'); return }
      newPositions = generateGridPositions(prefix, cols, rows)
    } else {
      if (!rowPrefix) { showToast('❌ Please enter a prefix'); return }
      newPositions = generateRowPositions(rowPrefix, positions)
    }
    
    const newLoc = {
      id: 'loc_' + Date.now(),
      name,
      type,
      prefix: type === 'grid' ? prefix : rowPrefix,
      columns: type === 'grid' ? cols : 1,
      rows: type === 'grid' ? rows : 1,
      positions: newPositions
    }
    
    const savedLocs = JSON.parse(localStorage.getItem('oog_locations') || '[]')
    savedLocs.push(newLoc)
    localStorage.setItem('oog_locations', JSON.stringify(savedLocs))
    setLocations([...locations, newLoc])
    showToast('✅ Location "' + name + '" added with ' + newPositions.length + ' positions')
    onSave()
    onClose()
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
        <h3 style={{color: textColor, marginBottom:'10px'}}>📍 Add New Location</h3>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Location Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Western Gate" style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} />
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Layout Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}}>
            <option value="grid">Grid (Rows + Columns)</option>
            <option value="row">Single Row</option>
          </select>
        </div>
        {type === 'grid' ? (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
              <div className="form-group" style={{marginBottom:'8px'}}>
                <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Columns</label>
                <input type="number" value={cols} onChange={(e) => setCols(parseInt(e.target.value) || 1)} min="1" max="20" style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} />
              </div>
              <div className="form-group" style={{marginBottom:'8px'}}>
                <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Rows</label>
                <input type="number" value={rows} onChange={(e) => setRows(parseInt(e.target.value) || 1)} min="1" max="20" style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} />
              </div>
            </div>
            <div className="form-group" style={{marginBottom:'8px'}}>
              <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Column Prefix</label>
              <input type="text" value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="e.g., J" style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} />
            </div>
          </div>
        ) : (
          <div>
            <div className="form-group" style={{marginBottom:'8px'}}>
              <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Number of Positions</label>
              <input type="number" value={positions} onChange={(e) => setPositions(parseInt(e.target.value) || 1)} min="1" max="30" style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} />
            </div>
            <div className="form-group" style={{marginBottom:'8px'}}>
              <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Position Prefix</label>
              <input type="text" value={rowPrefix} onChange={(e) => setRowPrefix(e.target.value)} placeholder="e.g., WG" style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} />
            </div>
          </div>
        )}
        <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{background:'#1e6f3f',color:'white',border:'none',borderRadius:'40px',padding:'5px 12px',fontWeight:'600',fontSize:'0.7rem',cursor: loading ? 'not-allowed' : 'pointer', flex:1}}>
            {loading ? 'Adding...' : '✅ Add Location'}
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
