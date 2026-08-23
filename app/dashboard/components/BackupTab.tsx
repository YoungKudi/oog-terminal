
import React from 'react'
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
  const [searchTerm, setSearchTerm] = React.useState('')

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

  return (
    <>
      <div className="card" style={{background: getColor(isDarkMode, 'white', '#111827'), borderRadius:'16px', marginBottom:'14px', border: getColor(isDarkMode, '1px solid #eef2f6', '1px solid #1f2937')}}>
        <div className="list-header" style={{background: getColor(isDarkMode, '#fefce8', '#0f172a'), borderRadius:'16px 16px 0 0', padding:'8px 14px', borderBottom: getColor(isDarkMode, '2px solid #eab308', '2px solid #8b5cf6'), display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'6px', color: getColor(isDarkMode, '#1e293b', '#f1f5f9')}}>
          <span>💾 Backup</span>
        </div>
        <div className="card-body" style={{padding:'10px 14px'}}>
          <button className="btn-primary btn-sm" onClick={exportBackup} style={{width:'100%',marginBottom:'6px',background:'#1e6f3f',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer'}}>📤 Export Backup</button>
          <input type="file" id="importDataFile" accept=".json" style={{display:'none'}} onChange={importBackup} />
          <button className="btn-outline btn-sm" onClick={() => document.getElementById('importDataFile')?.click()} style={{width:'100%',marginBottom:'10px',background:'white',border:'1.5px solid #cbd5e1',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer'}}>📥 Restore Backup</button>
          <div id="storageInfo" style={{padding:'8px',background: getColor(isDarkMode, '#f1f5f9', '#1e293b'), borderRadius:'12px',fontSize:'0.7rem',marginBottom:'10px',color: getColor(isDarkMode, '#1e293b', '#e2e8f0')}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(80px,1fr))',gap:'4px',textAlign:'center'}}>
              <div><strong>{containers.length}</strong><br /><span style={{fontSize:'0.6rem',color: getColor(isDarkMode, '#64748b', '#94a3b8')}}>📊 Stack</span></div>
              <div><strong>{importQueue.length}</strong><br /><span style={{fontSize:'0.6rem',color: getColor(isDarkMode, '#64748b', '#94a3b8')}}>📥 Queue</span></div>
              <div><strong>{devanningQueue.length}</strong><br /><span style={{fontSize:'0.6rem',color: getColor(isDarkMode, '#64748b', '#94a3b8')}}>⏳ Devanning</span></div>
              <div><strong>{unstuffedContainers.length}</strong><br /><span style={{fontSize:'0.6rem',color: getColor(isDarkMode, '#64748b', '#94a3b8')}}>✅ Unstuffed</span></div>
              <div><strong>{evacuationRecords.length}</strong><br /><span style={{fontSize:'0.6rem',color: getColor(isDarkMode, '#64748b', '#94a3b8')}}>🚚 Evacuated</span></div>
              <div><strong>{loadingRecords.length}</strong><br /><span style={{fontSize:'0.6rem',color: getColor(isDarkMode, '#64748b', '#94a3b8')}}>📋 Loaded</span></div>
              <div><strong>{totalScans}</strong><br /><span style={{fontSize:'0.6rem',color: getColor(isDarkMode, '#64748b', '#94a3b8')}}>📷 Scans</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{background: getColor(isDarkMode, 'white', '#111827'), borderRadius:'16px', marginBottom:'14px', border: getColor(isDarkMode, '1px solid #eef2f6', '1px solid #1f2937')}}>
        <div className="list-header" style={{background: getColor(isDarkMode, '#fefce8', '#0f172a'), borderRadius:'16px 16px 0 0', padding:'8px 14px', borderBottom: getColor(isDarkMode, '2px solid #eab308', '2px solid #8b5cf6'), display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'6px', color: getColor(isDarkMode, '#1e293b', '#f1f5f9')}}>
          <span>📋 Activity Log</span>
        </div>
        <div className="card-body" style={{padding:'10px 14px'}}>
          <div className="search-box" style={{display:'flex',gap:'6px',marginBottom:'10px',flexWrap:'wrap',alignItems:'center'}}>
            <input 
              type="text" 
              placeholder="🔍 Search logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{flex:1,minWidth:'120px',padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: getColor(isDarkMode, 'white', '#1e293b'), color: getColor(isDarkMode, '#1e293b', '#e2e8f0')}} 
            />
          </div>
          <div id="activityLog" style={{maxHeight:'300px',overflowY:'auto',fontSize:'0.65rem'}}>
            <div style={{padding:'16px',textAlign:'center',color:'#64748b',fontSize:'0.75rem'}}>📋 Activity logs will appear here</div>
          </div>
        </div>
      </div>
    </>
  )
}

