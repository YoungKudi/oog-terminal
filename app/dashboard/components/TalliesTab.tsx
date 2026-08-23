"use client"
import React, { useState } from 'react'
import { getColor, parseCargoNumber } from '@/lib/utils'
import { useSession } from 'next-auth/react'

interface TalliesTabProps {
  containers: any[]
  locations: any[]
  allPositions: string[]
  isDarkMode: boolean
  showToast: (msg: string) => void
  fetchAllData: () => void
  setSelectedContainer: (container: any) => void
  setShowContainerDetailModal: (show: boolean) => void
  setShowEditModal: (show: boolean) => void
  setShowRepositionModal: (show: boolean) => void
}

export default function TalliesTab({
  containers,
  locations,
  allPositions,
  isDarkMode,
  showToast,
  fetchAllData,
  setSelectedContainer,
  setShowContainerDetailModal,
  setShowEditModal,
  setShowRepositionModal
}: TalliesTabProps) {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [clearing, setClearing] = useState(false)
  
  const isOfficer = session?.user?.role === 'officer'
  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#64748b', '#94a3b8')
  const cardBg = getColor(isDarkMode, 'white', '#111827')
  const borderColor = getColor(isDarkMode, '#eef2f6', '#1f2937')
  const inputBg = getColor(isDarkMode, 'white', '#1e293b')
  const inputText = getColor(isDarkMode, '#1e293b', '#e2e8f0')

  const handleSearch = () => {
    const term = searchTerm.trim().toUpperCase()
    if (!term) { showToast('Enter a container number'); return }
    const items = document.querySelectorAll('.tally-row')
    let found = false
    items.forEach(item => {
      const text = item.textContent?.toUpperCase() || ''
      if (text.includes(term)) {
        (item as HTMLElement).style.display = 'flex'
        ;(item as HTMLElement).style.border = '2px solid #f59e0b'
        found = true
      } else {
        (item as HTMLElement).style.display = 'none'
      }
    })
    if (!found) showToast('❌ No containers found')
    else showToast('✅ Found matching containers')
  }

  const clearSearch = () => {
    setSearchTerm('')
    document.querySelectorAll('.tally-row').forEach(item => {
      (item as HTMLElement).style.display = 'flex'
      ;(item as HTMLElement).style.border = ''
    })
  }

  const deleteContainer = async (num: string) => {
    if (!confirm('Delete container ' + num + '?')) return
    const c = containers.find(x => x.containerNumber === num)
    if (!c) return
    try {
      const res = await fetch('/api/containers/' + c.id, { method: 'DELETE' })
      if (res.ok) { showToast('🗑️ Deleted'); fetchAllData() } else { showToast('❌ Failed') }
    } catch (err) { showToast('❌ Network error') }
  }

  const handleClearStack = async () => {
    if (!isOfficer) {
      showToast('❌ Only officers can clear the stack')
      return
    }
    
    if (containers.length === 0) {
      showToast('ℹ️ Stack is already empty')
      return
    }
    
    // Show confirmation dialog with count
    if (!confirm(`⚠️⚠️⚠️ DANGER: This will permanently DELETE ALL ${containers.length} containers in the stack!\n\nThis action CANNOT be undone!\n\nAre you absolutely sure you want to continue?`)) {
      return
    }
    
    // Second confirmation for safety
    if (!confirm(`⚠️ FINAL WARNING: You are about to delete ${containers.length} containers.\n\nType "CLEAR" to confirm.`)) {
      return
    }
    
    const confirmText = prompt('Type "CLEAR" to confirm:')
    if (confirmText !== 'CLEAR') {
      showToast('❌ Clear cancelled')
      return
    }
    
    setClearing(true)
    try {
      const res = await fetch('/api/admin/clear-stack', {
        method: 'DELETE'
      })
      const data = await res.json()
      if (res.ok) {
        showToast(`✅ ${data.deleted} containers cleared from stack`)
        fetchAllData()
      } else {
        showToast('❌ ' + (data.error || 'Failed to clear stack'))
      }
    } catch (err) {
      showToast('❌ Network error')
    }
    setClearing(false)
  }

  const totalExcavators = containers.filter(c => c.equipment === 'Excavator' || c.equipment === '2x Excavator').length
  const totalCargo = containers.reduce((s, c) => s + parseCargoNumber(c.auxCargo), 0)

  return (
    <>
      <div className="search-box" style={{display:'flex',gap:'6px',marginBottom:'10px',flexWrap:'wrap',alignItems:'center'}}>
        <input 
          type="text" 
          placeholder="🔍 Search container..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{flex:1,minWidth:'120px',padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} 
        />
        <button className="btn-outline btn-sm" onClick={handleSearch} style={{background: getColor(isDarkMode, 'white', '#1e293b'), border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`, borderRadius:'40px', padding:'2px 8px', fontWeight:'600', fontSize:'0.6rem', cursor:'pointer', color: getColor(isDarkMode, '#1e293b', '#e2e8f0')}}>Search</button>
        <button className="btn-outline btn-sm" onClick={clearSearch} style={{background: getColor(isDarkMode, 'white', '#1e293b'), border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`, borderRadius:'40px', padding:'2px 8px', fontWeight:'600', fontSize:'0.6rem', cursor:'pointer', color: getColor(isDarkMode, '#1e293b', '#e2e8f0')}}>Clear</button>
        
        {isOfficer && containers.length > 0 && (
          <button 
            className="btn-danger btn-sm" 
            onClick={handleClearStack}
            disabled={clearing}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '40px',
              padding: '2px 8px',
              fontWeight: '600',
              fontSize: '0.6rem',
              cursor: clearing ? 'not-allowed' : 'pointer',
              opacity: clearing ? 0.6 : 1,
              marginLeft: 'auto'
            }}
          >
            {clearing ? '⏳ Clearing...' : `🗑️ Clear ALL Stack (${containers.length})`}
          </button>
        )}
      </div>
      <div>
        {containers.length === 0 ? (
          <div style={{padding:'16px',textAlign:'center',color:mutedColor,fontSize:'0.75rem'}}>📭 No containers in stack</div>
        ) : (
          locations.map(loc => {
            const locContainers = containers.filter(c => loc.positions?.includes(c.position))
            if (!locContainers.length) return null
            const sortedPos = [...loc.positions].sort()
            return (
              <div key={loc.id} className="section-card" style={{background: cardBg, borderRadius:'16px', marginBottom:'14px', border: `1px solid ${borderColor}`, overflow:'hidden'}}>
                <div className="section-title" style={{background: getColor(isDarkMode, '#f9fafb', '#0f172a'), padding:'8px 14px', fontWeight:'700', borderBottom: `1px solid ${getColor(isDarkMode, '#e9eef3', '#1e293b')}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'4px', fontSize:'0.8rem', color: textColor}}>
                  <span>📍 {loc.name}</span>
                  <span className="badge" style={{background: getColor(isDarkMode, '#fef3c7', '#312e81'), color: getColor(isDarkMode, '#b45309', '#c7d2fe'), padding:'1px 8px', borderRadius:'30px', fontSize:'0.6rem', fontWeight:'600'}}>{locContainers.length} containers</span>
                </div>
                <div style={{padding:'6px 10px'}}>
                  {sortedPos.map(pos => {
                    const posContainers = containers.filter(c => c.position === pos)
                    if (!posContainers.length) return null
                    return (
                      <div key={pos}>
                        <div style={{fontWeight:'600',margin:'4px 0 2px 4px',display:'flex',alignItems:'center',gap:'6px',fontSize:'0.8rem',color: textColor}}>
                          📍 {pos} <span style={{fontSize:'0.65rem',color:mutedColor}}>({posContainers.length})</span>
                        </div>
                        {posContainers.map(c => (
                          <div 
                            key={c.id} 
                            className="tally-row" 
                            style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'4px',background: getColor(isDarkMode, '#fefce8', '#1a1f2e'), padding:'6px 10px', margin:'3px 0', borderRadius:'14px', borderLeft: `3px solid ${getColor(isDarkMode, '#facc15', '#8b5cf6')}`, transition:'all 0.2s', cursor:'pointer'}} 
                            onClick={() => { setSelectedContainer(c); setShowContainerDetailModal(true) }}
                          >
                            <span className="container-number" style={{fontFamily:'monospace',fontWeight:'700',background: getColor(isDarkMode, 'white', '#0f172a'), padding:'2px 8px', borderRadius:'40px', minWidth:'100px', border: `1px solid ${getColor(isDarkMode, '#fde047', '#8b5cf6')}`, fontSize:'0.65rem', color: textColor}}>{c.containerNumber}</span>
                            <span style={{fontSize:'0.6rem',color: mutedColor}}>{c.size}ft {c.type}</span>
                            <span className="equipment-badge" style={{background: getColor(isDarkMode, '#dbeafe', '#1e3a8a'), color: getColor(isDarkMode, '#1e40af', '#bfdbfe'), padding:'1px 8px', borderRadius:'30px', fontSize:'0.6rem', fontWeight:'600'}}>{c.equipment}</span>
                            <span style={{fontSize:'0.6rem',color: mutedColor}}>📦 {c.auxCargo || '0'}</span>
                            <div className="action-icons" style={{display:'flex',gap:'3px',marginLeft:'auto',flexWrap:'wrap'}} onClick={(e) => e.stopPropagation()}>
                              <button className="icon-btn move" onClick={() => { setSelectedContainer(c); setShowRepositionModal(true) }} style={{background: getColor(isDarkMode, '#eff6ff', '#1e3a8a'), border:'none', borderRadius:'40px', padding:'2px 6px', cursor:'pointer', fontSize:'0.6rem', color:'#2563eb'}}>↕</button>
                              <button className="icon-btn edit" onClick={() => { setSelectedContainer(c); setShowEditModal(true) }} style={{background: getColor(isDarkMode, '#fef3c7', '#78350f'), border:'none', borderRadius:'40px', padding:'2px 6px', cursor:'pointer', fontSize:'0.6rem', color:'#f59e0b'}}>✏️</button>
                              <button className="icon-btn delete" onClick={() => deleteContainer(c.containerNumber)} style={{background: getColor(isDarkMode, '#fef2f2', '#7f1d1d'), border:'none', borderRadius:'40px', padding:'2px 6px', cursor:'pointer', fontSize:'0.6rem', color:'#dc2626'}}>🗑️</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
      <div className="card" style={{background: cardBg, borderRadius:'16px', marginBottom:'14px', border: `1px solid ${borderColor}`}}>
        <div className="list-header" style={{background: getColor(isDarkMode, '#fefce8', '#0f172a'), borderRadius:'16px 16px 0 0', padding:'8px 14px', borderBottom: `2px solid ${getColor(isDarkMode, '#eab308', '#8b5cf6')}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'6px', color: getColor(isDarkMode, '#1e293b', '#f1f5f9')}}>
          <span>📊 Yard Summary</span>
          {isOfficer && containers.length > 0 && (
            <button 
              className="btn-danger btn-sm" 
              onClick={handleClearStack}
              disabled={clearing}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '40px',
                padding: '2px 8px',
                fontWeight: '600',
                fontSize: '0.6rem',
                cursor: clearing ? 'not-allowed' : 'pointer',
                opacity: clearing ? 0.6 : 1
              }}
            >
              {clearing ? '⏳ Clearing...' : `🗑️ Clear ALL Stack`}
            </button>
          )}
        </div>
        <div className="card-body" style={{padding:'10px 14px'}}>
          <div style={{fontSize:'0.85rem', color: textColor}}>
            <strong>🏗️ Total:</strong> {containers.length} | 
            <strong> 🚜 Excavators:</strong> {totalExcavators} | 
            <strong> 📦 Cargo:</strong> {totalCargo}
          </div>
        </div>
      </div>
    </>
  )
}
