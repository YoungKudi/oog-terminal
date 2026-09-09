"use client"
import React, { useState, useEffect } from 'react'
import { getColor } from '@/lib/utils'

interface BackupTabProps {
  containers: any[]
  importQueue: any[]
  devanningQueue: any[]
  unstuffedContainers: any[]
  evacuationRecords: any[]
  loadingRecords: any[]
  scannedDocuments: any
  locations: any[]
  shiftData: any
  isDarkMode: boolean
  showToast: (msg: string) => void
  fetchAllData: () => void
}

export default function BackupTab({
  containers,
  importQueue,
  devanningQueue,
  unstuffedContainers,
  evacuationRecords,
  loadingRecords,
  scannedDocuments,
  locations,
  shiftData,
  isDarkMode,
  showToast,
  fetchAllData
}: BackupTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [usernameFilter, setUsernameFilter] = useState('')
  const [activityLog, setActivityLog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredLogs, setFilteredLogs] = useState<any[]>([])

  useEffect(() => {
    fetchActivityLog()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [activityLog, searchTerm, dateFilter, usernameFilter])

  const fetchActivityLog = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/activity?limit=500')
      if (res.ok) {
        const data = await res.json()
        setActivityLog(data)
        setFilteredLogs(data)
      }
    } catch (error) {
      console.error('Error fetching activity log:', error)
    }
    setLoading(false)
  }

  const filterLogs = () => {
    let filtered = [...activityLog]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(log => 
        log.containerNumber?.toLowerCase().includes(term) ||
        log.action?.toLowerCase().includes(term) ||
        log.details?.toLowerCase().includes(term)
      )
    }

    if (dateFilter) {
      filtered = filtered.filter(log => {
        const logDate = log.createdAt?.split('T')[0]
        return logDate === dateFilter
      })
    }

    if (usernameFilter) {
      filtered = filtered.filter(log => 
        log.User?.name?.toLowerCase().includes(usernameFilter.toLowerCase()) ||
        log.User?.userId?.toLowerCase().includes(usernameFilter.toLowerCase())
      )
    }

    setFilteredLogs(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setDateFilter('')
    setUsernameFilter('')
  }

  const exportBackup = () => {
    const data = { 
      locations, containers, importQueue, devanningQueue, 
      unstuffedContainers, loadingRecords, evacuationRecords, 
      scannedDocuments, shiftData 
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'OOG_BACKUP_' + new Date().toISOString().slice(0,10) + '.json'
    a.click()
    URL.revokeObjectURL(url)
    showToast('💾 Backup exported')
  }

  const importBackup = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (data.containers) {
        let imported = 0
        for (const c of data.containers) {
          try { 
            await fetch('/api/containers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c) })
            imported++
          } catch(e) {}
        }
        showToast(`✅ Restored ${imported} containers`)
      }
      fetchAllData()
    } catch(err) {
      showToast('❌ Invalid backup file')
    }
    e.target.value = ''
  }

  const totalScans = Object.values(scannedDocuments).reduce((sum: number, docs: any) => sum + docs.length, 0)
  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#64748b', '#94a3b8')
  const cardBg = getColor(isDarkMode, 'white', '#111827')
  const borderColor = getColor(isDarkMode, '#eef2f6', '#1f2937')
  const inputBg = getColor(isDarkMode, 'white', '#1e293b')
  const inputText = getColor(isDarkMode, '#1e293b', '#e2e8f0')

  return (
    <>
      <div className="card" style={{background: cardBg, borderRadius:'16px', marginBottom:'14px', border: `1px solid ${borderColor}`}}>
        <div className="list-header" style={{background: getColor(isDarkMode, '#fefce8', '#0f172a'), borderRadius:'16px 16px 0 0', padding:'8px 14px', borderBottom: `2px solid ${getColor(isDarkMode, '#eab308', '#8b5cf6')}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'6px', color: getColor(isDarkMode, '#1e293b', '#f1f5f9')}}>
          <span>💾 Backup</span>
        </div>
        <div className="card-body" style={{padding:'10px 14px'}}>
          <button className="btn-primary btn-sm" onClick={exportBackup} style={{width:'100%',marginBottom:'6px',background:'#1e6f3f',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer'}}>📤 Export Backup</button>
          <input type="file" id="importDataFile" accept=".json" style={{display:'none'}} onChange={importBackup} />
          <button className="btn-outline btn-sm" onClick={() => document.getElementById('importDataFile')?.click()} style={{width:'100%',marginBottom:'10px',background: getColor(isDarkMode, 'white', '#1e293b'), border:`1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`, borderRadius:'40px', padding:'2px 8px', fontWeight:'600', fontSize:'0.6rem', cursor:'pointer', color: textColor}}>📥 Restore Backup</button>
          <div id="storageInfo" style={{padding:'8px',background: getColor(isDarkMode, '#f1f5f9', '#1e293b'), borderRadius:'12px',fontSize:'0.7rem',marginBottom:'10px',color: textColor}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(80px,1fr))',gap:'4px',textAlign:'center'}}>
              <div><strong>{containers.length}</strong><br /><span style={{fontSize:'0.6rem',color: mutedColor}}>📊 Stack</span></div>
              <div><strong>{importQueue.length}</strong><br /><span style={{fontSize:'0.6rem',color: mutedColor}}>📥 Queue</span></div>
              <div><strong>{devanningQueue.length}</strong><br /><span style={{fontSize:'0.6rem',color: mutedColor}}>⏳ Devanning</span></div>
              <div><strong>{unstuffedContainers.length}</strong><br /><span style={{fontSize:'0.6rem',color: mutedColor}}>✅ Unstuffed</span></div>
              <div><strong>{evacuationRecords.length}</strong><br /><span style={{fontSize:'0.6rem',color: mutedColor}}>🚚 Evacuated</span></div>
              <div><strong>{loadingRecords.length}</strong><br /><span style={{fontSize:'0.6rem',color: mutedColor}}>📋 Loaded</span></div>
              <div><strong>{totalScans}</strong><br /><span style={{fontSize:'0.6rem',color: mutedColor}}>📷 Scans</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{background: cardBg, borderRadius:'16px', marginBottom:'14px', border: `1px solid ${borderColor}`}}>
        <div className="list-header" style={{background: getColor(isDarkMode, '#fefce8', '#0f172a'), borderRadius:'16px 16px 0 0', padding:'8px 14px', borderBottom: `2px solid ${getColor(isDarkMode, '#eab308', '#8b5cf6')}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'6px', color: getColor(isDarkMode, '#1e293b', '#f1f5f9')}}>
          <span>📋 Activity Log ({filteredLogs.length} records)</span>
          <button className="btn-outline btn-sm" onClick={fetchActivityLog} style={{
            background: getColor(isDarkMode, 'white', '#1e293b'),
            border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`,
            borderRadius: '40px',
            padding: '2px 8px',
            fontWeight: '600',
            fontSize: '0.6rem',
            cursor: 'pointer',
            color: textColor
          }}>🔄 Refresh</button>
        </div>
        <div className="card-body" style={{padding:'10px 14px'}}>
          <div style={{display:'flex', gap:'6px', marginBottom:'10px', flexWrap:'wrap'}}>
            <input 
              type="text" 
              placeholder="🔍 Search container, action, details..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{flex:2,minWidth:'150px',padding:'6px 8px',borderRadius:'8px',border:'1px solid #cfdfed',fontSize:'0.7rem',background: inputBg, color: inputText}} 
            />
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{flex:1,minWidth:'130px',padding:'6px 8px',borderRadius:'8px',border:'1px solid #cfdfed',fontSize:'0.7rem',background: inputBg, color: inputText}} 
            />
            <input 
              type="text" 
              placeholder="👤 Username..." 
              value={usernameFilter}
              onChange={(e) => setUsernameFilter(e.target.value)}
              style={{flex:1,minWidth:'120px',padding:'6px 8px',borderRadius:'8px',border:'1px solid #cfdfed',fontSize:'0.7rem',background: inputBg, color: inputText}} 
            />
            <button className="btn-outline btn-sm" onClick={clearFilters} style={{
              padding:'4px 12px',
              borderRadius:'8px',
              border:'1px solid #cfdfed',
              background: 'transparent',
              fontSize:'0.6rem',
              cursor:'pointer',
              color: mutedColor
            }}>✕ Clear</button>
          </div>

          <div id="activityLog" style={{maxHeight:'400px',overflowY:'auto',fontSize:'0.65rem'}}>
            {loading ? (
              <div style={{padding:'20px',textAlign:'center',color:mutedColor}}>Loading...</div>
            ) : filteredLogs.length === 0 ? (
              <div style={{padding:'20px',textAlign:'center',color:mutedColor}}>📭 No activity logs found</div>
            ) : (
              filteredLogs.map((log: any) => {
                // SAFE RENDERING: Ensure we don't render objects directly
                const userName = log.User?.name || log.User?.userId || 'Unknown User'
                const actionDisplay = log.action || 'Unknown action'
                const containerDisplay = log.containerNumber ? `📦 ${log.containerNumber}` : ''
                const detailsDisplay = log.details || ''
                const timeDisplay = log.createdAt ? new Date(log.createdAt).toLocaleString() : ''

                return (
                  <div key={log.id} style={{
                    padding:'6px 10px',
                    marginBottom:'4px',
                    background: getColor(isDarkMode, '#f8fafc', '#1a1f2e'),
                    borderRadius:'6px',
                    borderLeft: `3px solid ${actionDisplay.includes('FAILED') ? '#dc2626' : '#10b981'}`,
                    color: textColor
                  }}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'4px'}}>
                      <span><strong>{actionDisplay}</strong> {containerDisplay}</span>
                      <span style={{fontSize:'0.55rem', color: mutedColor}}>{timeDisplay}</span>
                    </div>
                    {detailsDisplay && <div style={{fontSize:'0.6rem', color: mutedColor}}>{detailsDisplay}</div>}
                    <div style={{fontSize:'0.55rem', color: mutedColor}}>👤 {userName}</div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </>
  )
}
