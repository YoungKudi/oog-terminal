"use client"
import React from 'react'
import { getColor, formatDate } from '@/lib/utils'

interface UnstuffedTabProps {
  unstuffedContainers: any[]
  isDarkMode: boolean
  showToast: (msg: string) => void
  fetchAllData: () => void
  selectedEvacContainer: string | null
  setSelectedEvacContainer: (val: string | null) => void
  evacuationSelectionMode: boolean
  setEvacuationSelectionMode: (val: boolean) => void
  setSelectedContainer: (container: any) => void
  setShowContainerDetailModal: (show: boolean) => void
  setShowLoadoutModal: (show: boolean) => void
  setShowScannerModal: (show: boolean) => void
}

export default function UnstuffedTab({
  unstuffedContainers,
  isDarkMode,
  showToast,
  fetchAllData,
  selectedEvacContainer,
  setSelectedEvacContainer,
  evacuationSelectionMode,
  setEvacuationSelectionMode,
  setSelectedContainer,
  setShowContainerDetailModal,
  setShowLoadoutModal,
  setShowScannerModal
}: UnstuffedTabProps) {
  const [searchTerm, setSearchTerm] = React.useState('')

  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#64748b', '#94a3b8')
  const cardBg = getColor(isDarkMode, 'white', '#111827')
  const borderColor = getColor(isDarkMode, '#eef2f6', '#1f2937')
  const inputBg = getColor(isDarkMode, 'white', '#1e293b')
  const inputText = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const btnText = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const btnBg = getColor(isDarkMode, 'white', '#1e293b')

  const handleSearch = () => {
    const term = searchTerm.trim().toUpperCase()
    if (!term) { showToast('Enter a container number'); return }
    const items = document.querySelectorAll('.unstuffed-item')
    let found = false
    items.forEach(item => {
      const text = item.textContent?.toUpperCase() || ''
      if (text.includes(term)) {
        (item as HTMLElement).style.display = 'block'
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
    document.querySelectorAll('.unstuffed-item').forEach(item => {
      (item as HTMLElement).style.display = 'block'
      ;(item as HTMLElement).style.border = ''
    })
  }

  const processEvacuation = async () => {
    if (!selectedEvacContainer) { showToast('❌ Select a container first'); return }
    try {
      const res = await fetch('/api/evacuation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ containerNumber: selectedEvacContainer }) })
      if (res.ok) {
        showToast('🚚 Evacuated')
        setSelectedEvacContainer(null)
        setEvacuationSelectionMode(false)
        fetchAllData()
      }
    } catch (err) { showToast('❌ Network error') }
  }

  const toggleEvacuationMode = () => {
    setEvacuationSelectionMode(!evacuationSelectionMode)
    if (!evacuationSelectionMode) showToast('☑️ Click a container to select for evacuation')
    else showToast('🔴 Selection mode cancelled')
  }

  return (
    <div className="card" style={{background: cardBg, borderRadius:'16px', marginBottom:'14px', border: `1px solid ${borderColor}`}}>
      <div className="list-header" style={{background: getColor(isDarkMode, '#fefce8', '#0f172a'), borderRadius:'16px 16px 0 0', padding:'8px 14px', borderBottom: `2px solid ${getColor(isDarkMode, '#eab308', '#8b5cf6')}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'6px', color: getColor(isDarkMode, '#1e293b', '#f1f5f9')}}>
        <span>✅ Unstuffed Containers</span>
        <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
          <button className="btn-warning btn-sm" onClick={processEvacuation} style={{background:'#f59e0b',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer'}}>🚚 Evacuate Selected</button>
          <button className="btn-outline btn-sm" onClick={toggleEvacuationMode} style={{
            background: btnBg,
            border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`,
            borderRadius: '40px',
            padding: '2px 8px',
            fontWeight: '600',
            fontSize: '0.6rem',
            cursor: 'pointer',
            color: btnText
          }}>
            {evacuationSelectionMode ? '✕ Cancel Selection' : '☑️ Select for Evacuation'}
          </button>
          {evacuationSelectionMode && selectedEvacContainer && (
            <span style={{fontSize:'0.7rem',color:'#f59e0b',padding:'4px 8px'}}>Selected: {selectedEvacContainer}</span>
          )}
        </div>
      </div>
      <div className="card-body" style={{padding:'10px 14px'}}>
        <div className="search-box" style={{display:'flex',gap:'6px',marginBottom:'10px',flexWrap:'wrap',alignItems:'center'}}>
          <input 
            type="text" 
            placeholder="🔍 Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{flex:1,minWidth:'120px',padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} 
          />
          <button className="btn-outline btn-sm" onClick={handleSearch} style={{
            background: btnBg,
            border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`,
            borderRadius: '40px',
            padding: '2px 8px',
            fontWeight: '600',
            fontSize: '0.6rem',
            cursor: 'pointer',
            color: btnText
          }}>Search</button>
          <button className="btn-outline btn-sm" onClick={clearSearch} style={{
            background: btnBg,
            border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`,
            borderRadius: '40px',
            padding: '2px 8px',
            fontWeight: '600',
            fontSize: '0.6rem',
            cursor: 'pointer',
            color: btnText
          }}>Clear</button>
        </div>
        <div className={evacuationSelectionMode ? 'evacuation-selection-mode' : ''}>
          {unstuffedContainers.length === 0 ? (
            <div style={{padding:'16px',textAlign:'center',color:mutedColor,fontSize:'0.75rem'}}>✅ No unstuffed containers</div>
          ) : (
            unstuffedContainers.map((u: any) => {
              const isSelected = u.containerNumber === selectedEvacContainer
              const isExcavator = u.equipment === 'Excavator' || u.equipment === '2x Excavator'
              return (
                <div 
                  key={u.id} 
                  className="container-item-list unstuffed-item"
                  style={{background: getColor(isDarkMode, isSelected ? '#fef3c7' : '#ffffff', isSelected ? '#1e1b2e' : '#1a1f2e'), border: isSelected ? '2px solid #f59e0b' : `1px solid ${getColor(isDarkMode, '#eef2ff', '#2d3a5e')}`, padding:'8px 10px', marginBottom:'4px', borderRadius:'8px', cursor: evacuationSelectionMode ? 'pointer' : 'default'}} 
                  onClick={() => { 
                    if (evacuationSelectionMode) { 
                      setSelectedEvacContainer(u.containerNumber) 
                    } else { 
                      setSelectedContainer(u)
                      setShowContainerDetailModal(true)
                    }
                  }}
                >
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'4px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
                      {evacuationSelectionMode && <input type="radio" name="evacSelect" value={u.containerNumber} checked={isSelected} onChange={() => setSelectedEvacContainer(u.containerNumber)} style={{width:'auto'}} onClick={(e) => e.stopPropagation()} />}
                      <strong style={{fontSize:'0.8rem',color: textColor}}>{u.containerNumber}</strong>
                      <span style={{fontSize:'0.6rem',color: mutedColor}}>{u.position} | {u.equipment}</span>
                      <span className="devanning-type-badge" style={{background: getColor(isDarkMode, '#dbeafe', '#1e3a8a'), color: getColor(isDarkMode, '#1e40af', '#bfdbfe'), padding:'2px 10px', borderRadius:'20px', fontSize:'0.6rem', fontWeight:'600'}}>{u.devanningType?.replace('_',' ').toUpperCase() || 'UNSTUFFING'}</span>
                      {isExcavator && <span style={{fontSize:'0.6rem',color:'#f59e0b'}}>🚜</span>}
                    </div>
                    <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                      <button className="btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedContainer(u); setShowLoadoutModal(true) }} style={{background:'#1e6f3f',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer'}}>📋 Clearance</button>
                      <button className="btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedContainer(u); setShowScannerModal(true) }} style={{
                        background: btnBg,
                        border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`,
                        borderRadius: '40px',
                        padding: '2px 8px',
                        fontWeight: '600',
                        fontSize: '0.6rem',
                        cursor: 'pointer',
                        color: btnText
                      }}>📷 Scan</button>
                    </div>
                  </div>
                  {u.vessel && <div style={{fontSize:'0.6rem',color: mutedColor}}>🚢 Vessel: {u.vessel} | Arrival: {u.arrivalDate || ''}</div>}
                  {u.agency && <div style={{fontSize:'0.6rem',color: mutedColor}}>🏢 Agency: {u.agency}</div>}
                  {u.unstuffedAt && <div style={{fontSize:'0.6rem',color: mutedColor}}>✅ Unstuffed: {formatDate(u.unstuffedAt)}</div>}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
