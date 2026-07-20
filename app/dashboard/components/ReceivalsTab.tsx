"use client"
import React, { useState } from 'react'
import { getColor } from '@/lib/utils'
import { useSession } from 'next-auth/react'

interface ReceivalsTabProps {
  containers: any[]
  isDarkMode: boolean
  showToast: (msg: string) => void
  setSelectedContainer: (container: any) => void
  setShowContainerDetailModal: (show: boolean) => void
  fetchAllData: () => void
}

export default function ReceivalsTab({ 
  containers, isDarkMode, showToast, setSelectedContainer, setShowContainerDetailModal, fetchAllData
}: ReceivalsTabProps) {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [clearing, setClearing] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  
  const isOfficer = session?.user?.role === 'officer'
  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#64748b', '#94a3b8')
  const cardBg = getColor(isDarkMode, 'white', '#111827')
  const borderColor = getColor(isDarkMode, '#eef2f6', '#1f2937')
  const inputBg = getColor(isDarkMode, 'white', '#1e293b')
  const inputText = getColor(isDarkMode, '#1e293b', '#e2e8f0')

  // Filter containers from last 4 days
  const fourDaysAgo = new Date()
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4)
  
  const recentContainers = containers.filter(c => {
    const receivedDate = new Date(c.receivedDate)
    return receivedDate >= fourDaysAgo
  })

  const olderContainers = containers.filter(c => {
    const receivedDate = new Date(c.receivedDate)
    return receivedDate < fourDaysAgo
  })

  const grouped = recentContainers.reduce((acc, c) => {
    const date = c.receivedDate ? new Date(c.receivedDate).toLocaleDateString() : 'Unknown'
    if (!acc[date]) acc[date] = []
    acc[date].push(c)
    return acc
  }, {} as Record<string, any[]>)

  const handleSearch = () => {
    const term = searchTerm.trim().toUpperCase()
    if (!term) { showToast('Enter a container number'); return }
    const items = document.querySelectorAll('.receival-item')
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
    document.querySelectorAll('.receival-item').forEach(item => {
      (item as HTMLElement).style.display = 'block'
      ;(item as HTMLElement).style.border = ''
    })
  }

  const handleClearReceivals = async () => {
    if (!isOfficer) {
      showToast('❌ Only officers can clear receivals')
      return
    }
    
    const totalOlder = olderContainers.length
    if (totalOlder === 0) {
      showToast('ℹ️ No containers older than 4 days to clear')
      setShowClearConfirm(false)
      return
    }
    
    // Show confirmation dialog
    if (!confirm(`⚠️ This will permanently delete ${totalOlder} containers older than 4 days.\n\nAre you sure you want to continue?`)) {
      return
    }
    
    setClearing(true)
    try {
      const res = await fetch(`/api/admin/clear-receivals?days=4`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (res.ok) {
        showToast(`✅ ${data.deleted} containers cleared`)
        setShowClearConfirm(false)
        fetchAllData()
      } else {
        showToast('❌ ' + (data.error || 'Failed to clear receivals'))
      }
    } catch (err) {
      showToast('❌ Network error')
    }
    setClearing(false)
  }

  return (
    <div className="card" style={{background: cardBg, borderRadius:'16px', marginBottom:'14px', border: `1px solid ${borderColor}`}}>
      <div className="list-header" style={{background: getColor(isDarkMode, '#fefce8', '#0f172a'), borderRadius:'16px 16px 0 0', padding:'8px 14px', borderBottom: `2px solid ${getColor(isDarkMode, '#eab308', '#8b5cf6')}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'6px', color: getColor(isDarkMode, '#1e293b', '#f1f5f9')}}>
        <span>📦 Recent Receivals (Last 4 Days)</span>
        {isOfficer && olderContainers.length > 0 && (
          <button 
            className="btn-danger btn-sm" 
            onClick={handleClearReceivals}
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
            {clearing ? '⏳ Clearing...' : `🗑️ Clear Old (${olderContainers.length})`}
          </button>
        )}
      </div>
      <div className="card-body" style={{padding:'10px 14px'}}>
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
        </div>
        <div>
          {recentContainers.length === 0 ? (
            <div style={{padding:'16px',textAlign:'center',color:mutedColor,fontSize:'0.75rem'}}>📭 No containers received in the last 4 days</div>
          ) : (
            Object.entries(grouped).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()).map(([date, items]) => (
              <div key={date}>
                <div className="date-separator" style={{background: getColor(isDarkMode, '#f1f5f9', '#1e1b2e'), padding:'4px 10px', borderRadius:'8px', margin:'6px 0', fontWeight:'600', fontSize:'0.7rem', color: getColor(isDarkMode, '#1e293b', '#c7d2fe')}}>
                  📅 {date}
                  <span style={{fontSize:'0.6rem', color: mutedColor}}>({items.length})</span>
                </div>
                {items.map((c: any) => (
                  <div 
                    key={c.id} 
                    className="container-item-list receival-item"
                    style={{background: getColor(isDarkMode, '#ffffff', '#1a1f2e'), border: `1px solid ${getColor(isDarkMode, '#eef2ff', '#2d3a5e')}`, padding:'6px 10px', marginBottom:'4px', borderRadius:'8px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'4px', cursor:'pointer'}} 
                    onClick={() => { setSelectedContainer(c); setShowContainerDetailModal(true) }}
                  >
                    <div><strong style={{fontSize:'0.75rem',color: textColor}}>{c.containerNumber}</strong>
                      <span style={{fontSize:'0.6rem',color: mutedColor}}> | {c.position} | {c.equipment}</span>
                    </div>
                    <span className="badge" style={{background: getColor(isDarkMode, '#dbeafe', '#312e81'), color: getColor(isDarkMode, '#1e40af', '#c7d2fe'), padding:'1px 8px', borderRadius:'30px', fontSize:'0.6rem', fontWeight:'600'}}>{c.size}ft</span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
        
        {isOfficer && olderContainers.length > 0 && (
          <div style={{marginTop:'12px', padding:'8px 12px', background: getColor(isDarkMode, '#fef2f2', '#1a1a2e'), borderRadius:'8px', border: `1px solid ${getColor(isDarkMode, '#fca5a5', '#7f1d1d')}`}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'4px'}}>
              <span style={{fontSize:'0.7rem', color: getColor(isDarkMode, '#dc2626', '#fca5a5')}}>
                ⚠️ {olderContainers.length} container(s) older than 4 days
              </span>
              <button 
                className="btn-danger btn-sm" 
                onClick={handleClearReceivals}
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
                {clearing ? '⏳ Clearing...' : `🗑️ Clear All Old (${olderContainers.length})`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
