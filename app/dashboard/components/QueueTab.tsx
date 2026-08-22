"use client"
import React, { useState } from 'react'
import { getColor } from '@/lib/utils'

interface QueueTabProps {
  importQueue: any[]
  isDarkMode: boolean
  showToast: (msg: string) => void
  fetchAllData: () => void
}

export default function QueueTab({ importQueue, isDarkMode, showToast, fetchAllData }: QueueTabProps) {
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importTotal, setImportTotal] = useState(0)
  const [importedCount, setImportedCount] = useState(0)

  const acceptQueue = async (id: string) => {
    const res = await fetch('/api/import-queue/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'accept' }) })
    if (res.ok) { showToast('✅ Accepted'); fetchAllData() } else { showToast('❌ Failed') }
  }

  const rejectQueue = async (id: string) => {
    if (!confirm('Reject this container?')) return
    const res = await fetch('/api/import-queue/' + id, { method: 'DELETE' })
    if (res.ok) { showToast('❌ Rejected'); fetchAllData() } else { showToast('❌ Failed') }
  }

  const acceptAll = async () => {
    if (!importQueue.length) { showToast('Queue is empty'); return }
    if (!confirm('Accept all ' + importQueue.length + ' containers?')) return
    
    setImporting(true)
    setImportTotal(importQueue.length)
    setImportedCount(0)
    setImportProgress(0)
    
    let count = 0
    for (const item of importQueue) {
      const res = await fetch('/api/import-queue/' + item.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'accept' }) })
      if (res.ok) count++
      setImportedCount(count)
      setImportProgress(Math.round((count / importQueue.length) * 100))
    }
    
    setImporting(false)
    showToast('✅ Accepted ' + count + ' of ' + importQueue.length + ' containers')
    fetchAllData()
  }

  const rejectAll = async () => {
    if (!importQueue.length) { showToast('Queue is empty'); return }
    if (!confirm('Reject all ' + importQueue.length + ' containers?')) return
    for (const item of importQueue) {
      await fetch('/api/import-queue/' + item.id, { method: 'DELETE' })
    }
    showToast('❌ Rejected all'); fetchAllData()
  }

  const handleCSVImport = () => {
    document.getElementById('importQueueFile')?.click()
  }

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    const total = lines.length - 1
    
    setImporting(true)
    setImportTotal(total)
    setImportedCount(0)
    setImportProgress(0)
    
    let imported = 0
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim())
      if (parts.length < 4) continue
      const [containerNumber, position, size, type, equipment, auxCargo, remarks] = parts
      if (!containerNumber) continue
      try {
        const res = await fetch('/api/import-queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            containerNumber, 
            position: position || 'R1', 
            size: size || '40', 
            type: type || 'FR', 
            equipment: equipment || 'General', 
            auxCargo: auxCargo || '', 
            remarks: remarks || '' 
          })
        })
        if (res.ok) imported++
        setImportedCount(imported)
        setImportProgress(Math.round((imported / total) * 100))
      } catch (err) {}
    }
    
    setImporting(false)
    showToast(`✅ Imported ${imported} containers to queue`)
    fetchAllData()
    e.target.value = ''
  }

  const downloadTemplate = () => {
    const template = 'ContainerNumber,Position,Size,Type,Equipment,AuxCargo,Remarks\nMAEU1234567,R1,40,FR,Excavator,0,Test container'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'OOG_IMPORT_TEMPLATE.csv'
    a.click()
    URL.revokeObjectURL(url)
    showToast('📥 Template downloaded')
  }

  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#64748b', '#94a3b8')
  const cardBg = getColor(isDarkMode, 'white', '#111827')
  const headerBg = getColor(isDarkMode, '#fefce8', '#0f172a')
  const borderColor = getColor(isDarkMode, '#eef2f6', '#1f2937')
  const inputBg = getColor(isDarkMode, 'white', '#1e293b')
  const btnBg = getColor(isDarkMode, 'white', '#1e293b')
  const btnText = getColor(isDarkMode, '#1e293b', '#e2e8f0')

  return (
    <div className="card" style={{background: cardBg, borderRadius:'16px', marginBottom:'14px', border: `1px solid ${borderColor}`}}>
      <div className="list-header" style={{background: headerBg, borderRadius:'16px 16px 0 0', padding:'8px 14px', borderBottom: `2px solid ${getColor(isDarkMode, '#eab308', '#8b5cf6')}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'6px', color: getColor(isDarkMode, '#1e293b', '#f1f5f9')}}>
        <span>📥 Import Queue</span>
        <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
          <button className="btn-primary btn-sm" onClick={handleCSVImport} style={{background:'#1e6f3f',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer'}}>📤 Import CSV</button>
          <button className="btn-outline btn-sm" onClick={downloadTemplate} style={{background: btnBg, color: btnText, border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`, borderRadius:'40px', padding:'2px 8px', fontWeight:'600', fontSize:'0.6rem', cursor:'pointer'}}>📄 Template</button>
          <button className="btn-success btn-sm" onClick={acceptAll} style={{background:'#10b981',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer'}}>✅ Accept All</button>
          <button className="btn-danger btn-sm" onClick={rejectAll} style={{background:'#dc2626',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer'}}>❌ Reject All</button>
        </div>
      </div>
      <div className="card-body" style={{padding:'10px 14px'}}>
        <input type="file" id="importQueueFile" accept=".csv" style={{display:'none'}} onChange={handleFileUpload} />
        
        {importing && (
          <div style={{marginBottom:'12px'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.6rem',color: mutedColor}}>
              <span>Importing... {importedCount}/{importTotal}</span>
              <span>{importProgress}%</span>
            </div>
            <div style={{width:'100%',height:'6px',background: getColor(isDarkMode, '#e2e8f0', '#334155'),borderRadius:'3px',overflow:'hidden'}}>
              <div style={{width:importProgress + '%',height:'100%',background:'#1e6f3f',transition:'width 0.3s ease'}} />
            </div>
          </div>
        )}
        
        <div>
          {importQueue.length === 0 ? (
            <div style={{padding:'16px',textAlign:'center',color:mutedColor,fontSize:'0.75rem'}}>📭 No pending imports</div>
          ) : (
            importQueue.map(item => (
              <div key={item.id} className="container-item-list import-item" style={{background: getColor(isDarkMode, '#fefce8', '#1e1b2e'), borderLeft:'4px solid #f59e0b', padding:'8px 10px', marginBottom:'4px', borderRadius:'8px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'4px'}}>
                <div><strong style={{fontSize:'0.8rem',color: textColor}}>{item.containerNumber}</strong>
                  <span style={{fontSize:'0.6rem',color: mutedColor}}> | {item.position} | {item.equipment}</span>
                </div>
                <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                  <button className="btn-success btn-sm" onClick={() => acceptQueue(item.id)} style={{background:'#10b981',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer'}}>✅ Accept</button>
                  <button className="btn-danger btn-sm" onClick={() => rejectQueue(item.id)} style={{background:'#dc2626',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer'}}>✕</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
