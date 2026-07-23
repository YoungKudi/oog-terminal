import React from "react"
import React from "react"
"use client"
import React from 'react'
import { getColor } from '@/lib/utils'

interface ContainerDetailModalProps {
  onClose: () => void
  isDarkMode: boolean
  container: any
  containers: any[]
  devanningQueue: any[]
  unstuffedContainers: any[]
  scannedDocuments: any
  showToast: (msg: string) => void
  setShowScannerModal: (show: boolean) => void
  setShowEditModal: (show: boolean) => void
  setShowDevanningModal: (show: boolean) => void
  setShowLoadoutModal: (show: boolean) => void
  fetchAllData: () => void
}

export default function ContainerDetailModal({
  onClose,
  isDarkMode,
  container,
  containers,
  devanningQueue,
  unstuffedContainers,
  scannedDocuments,
  showToast,
  setShowScannerModal,
  setShowEditModal,
  setShowDevanningModal,
  setShowLoadoutModal,
  fetchAllData
}: ContainerDetailModalProps) {
  if (!container) return null

  // Check container status
  const inDevanning = devanningQueue.find(d => d.containerNumber === container.containerNumber)
  const inUnstuffed = unstuffedContainers.find(u => u.containerNumber === container.containerNumber)
  const inStack = containers.find(c => c.containerNumber === container.containerNumber)
  
  // Determine status
  let statusText = '📦 In Stack'
  let statusColor = '#10b981'
  if (inDevanning) {
    statusText = '⏳ In Devanning'
    statusColor = '#f59e0b'
  } else if (inUnstuffed) {
    statusText = '✅ Unstuffed'
    statusColor = '#3b82f6'
  }

  const isExcavator = container.equipment === 'Excavator' || container.equipment === '2x Excavator'
  const docs = scannedDocuments[container.containerNumber] || []

  const unstuffContainer = async (id: string) => {
    try {
      const res = await fetch('/api/devanning/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'unstuff' }) })
      if (res.ok) { showToast('✅ Unstuffed'); fetchAllData(); onClose() } else { showToast('❌ Failed') }
    } catch (err) { showToast('❌ Network error') }
  }

  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#64748b', '#94a3b8')
  const borderColor = getColor(isDarkMode, '#e2e8f0', '#334155')
  const bgColor = getColor(isDarkMode, 'white', '#1e293b')

  return (
    <div className="modal" style={{display:'flex', position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', justifyContent:'center', alignItems:'center', zIndex:1000}}>
      <div className="modal-content" style={{background: bgColor, color: textColor, borderRadius:'24px', padding:'18px', maxWidth:'440px', width:'92%', maxHeight:'80vh', overflowY:'auto', border: `1px solid ${borderColor}`}}>
        <h3 style={{color: textColor, marginBottom:'10px'}}>📦 Container Details</h3>
        
        <div className="detail-row" style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom: `1px solid ${borderColor}`,fontSize:'0.8rem',color: textColor}}>
          <span className="label" style={{fontWeight:'600',color: mutedColor}}>Container</span>
          <span className="value" style={{fontWeight:'500'}}>{container.containerNumber}</span>
        </div>
        <div className="detail-row" style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom: `1px solid ${borderColor}`,fontSize:'0.8rem',color: textColor}}>
          <span className="label" style={{fontWeight:'600',color: mutedColor}}>Position</span>
          <span className="value" style={{fontWeight:'500'}}>{container.position}</span>
        </div>
        <div className="detail-row" style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom: `1px solid ${borderColor}`,fontSize:'0.8rem',color: textColor}}>
          <span className="label" style={{fontWeight:'600',color: mutedColor}}>Size</span>
          <span className="value" style={{fontWeight:'500'}}>{container.size}ft</span>
        </div>
        <div className="detail-row" style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom: `1px solid ${borderColor}`,fontSize:'0.8rem',color: textColor}}>
          <span className="label" style={{fontWeight:'600',color: mutedColor}}>Type</span>
          <span className="value" style={{fontWeight:'500'}}>{container.type}</span>
        </div>
        <div className="detail-row" style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom: `1px solid ${borderColor}`,fontSize:'0.8rem',color: textColor}}>
          <span className="label" style={{fontWeight:'600',color: mutedColor}}>Equipment</span>
          <span className="value" style={{fontWeight:'500'}}>{container.equipment}</span>
        </div>
        <div className="detail-row" style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom: `1px solid ${borderColor}`,fontSize:'0.8rem',color: textColor}}>
          <span className="label" style={{fontWeight:'600',color: mutedColor}}>Aux Cargo</span>
          <span className="value" style={{fontWeight:'500'}}>{container.auxCargo || '-'}</span>
        </div>
        
        {/* Status */}
        <div className="detail-row" style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom: `1px solid ${borderColor}`,fontSize:'0.8rem',color: textColor}}>
          <span className="label" style={{fontWeight:'600',color: mutedColor}}>Status</span>
          <span className="value" style={{fontWeight:'500', color: statusColor}}>{statusText}</span>
        </div>
        
        {container.vessel && (
          <div className="detail-row" style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom: `1px solid ${borderColor}`,fontSize:'0.8rem',color: textColor}}>
            <span className="label" style={{fontWeight:'600',color: mutedColor}}>Vessel</span>
            <span className="value" style={{fontWeight:'500'}}>{container.vessel}</span>
          </div>
        )}
        {container.arrivalDate && (
          <div className="detail-row" style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom: `1px solid ${borderColor}`,fontSize:'0.8rem',color: textColor}}>
            <span className="label" style={{fontWeight:'600',color: mutedColor}}>Arrival Date</span>
            <span className="value" style={{fontWeight:'500'}}>{container.arrivalDate}</span>
          </div>
        )}
        {container.receivedDate && (
          <div className="detail-row" style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom: `1px solid ${borderColor}`,fontSize:'0.8rem',color: textColor}}>
            <span className="label" style={{fontWeight:'600',color: mutedColor}}>Received</span>
            <span className="value" style={{fontWeight:'500'}}>{container.receivedDate || '-'}</span>
          </div>
        )}
        {container.unstuffedAt && (
          <div className="detail-row" style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom: `1px solid ${borderColor}`,fontSize:'0.8rem',color: textColor}}>
            <span className="label" style={{fontWeight:'600',color: mutedColor}}>Unstuffed</span>
            <span className="value" style={{fontWeight:'500'}}>{container.unstuffedAt}</span>
          </div>
        )}
        {container.devanningType && (
          <div className="detail-row" style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom: `1px solid ${borderColor}`,fontSize:'0.8rem',color: textColor}}>
            <span className="label" style={{fontWeight:'600',color: mutedColor}}>Devanning Type</span>
            <span className="value" style={{fontWeight:'500'}}>{container.devanningType}</span>
          </div>
        )}
        {container.agency && (
          <div className="detail-row" style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom: `1px solid ${borderColor}`,fontSize:'0.8rem',color: textColor}}>
            <span className="label" style={{fontWeight:'600',color: mutedColor}}>Agency</span>
            <span className="value" style={{fontWeight:'500'}}>{container.agency}</span>
          </div>
        )}
        {container.remarks && (
          <div className="detail-row" style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom: `1px solid ${borderColor}`,fontSize:'0.8rem',color: textColor}}>
            <span className="label" style={{fontWeight:'600',color: mutedColor}}>Remarks</span>
            <span className="value" style={{fontWeight:'500'}}>{container.remarks}</span>
          </div>
        )}

        {isExcavator && (inDevanning || container.vessel) && (
          <div className="excavator-details" style={{marginTop:'8px',padding:'8px',background: getColor(isDarkMode, '#fef3c7', '#1e293b'),borderRadius:'8px',fontSize:'0.75rem',border:`1px solid #f59e0b`,color: textColor}}>
            <strong>🚜 Excavator Details</strong><br />
            <span className="label" style={{color: getColor(isDarkMode, '#92400e', '#94a3b8')}}>Vessel: </span>
            <span className="value" style={{color: getColor(isDarkMode, '#78350f', '#fbbf24'),fontWeight:'600'}}>{container.vessel || '-'}</span>
            <span className="label" style={{color: getColor(isDarkMode, '#92400e', '#94a3b8')}}>Arrival: </span>
            <span className="value" style={{color: getColor(isDarkMode, '#78350f', '#fbbf24'),fontWeight:'600'}}>{container.arrivalDate || '-'}</span>
          </div>
        )}

        {docs.length > 0 && (
          <div style={{marginTop:'8px',padding:'8px',background:'#dcfce7',borderRadius:'8px',fontSize:'0.75rem',color:'#1e293b'}}>
            <strong>📎 Attached Documents ({docs.length})</strong><br />
            {docs.map((d: any, i: number) => `${d.type}: ${d.name}`).join('<br />')}
          </div>
        )}

        <div style={{marginTop:'10px',display:'flex',gap:'4px',flexWrap:'wrap'}}>
          <button onClick={() => { onClose(); setShowScannerModal(true) }} style={{background: getColor(isDarkMode, 'white', '#1e293b'), border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`, borderRadius:'40px', padding:'2px 8px', fontWeight:'600', fontSize:'0.6rem', cursor:'pointer', color: getColor(isDarkMode, '#1e293b', '#e2e8f0')}}>📷 Scan</button>
          <button onClick={() => { onClose(); setShowEditModal(true) }} style={{background: getColor(isDarkMode, 'white', '#1e293b'), border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`, borderRadius:'40px', padding:'2px 8px', fontWeight:'600', fontSize:'0.6rem', cursor:'pointer', color: getColor(isDarkMode, '#1e293b', '#e2e8f0')}}>✏️ Edit</button>
          
          {inStack && !inDevanning && !inUnstuffed && (
            <button onClick={() => { onClose(); setShowDevanningModal(true) }} style={{background:'#1e6f3f',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer'}}>🏗️ Devan</button>
          )}
          {inDevanning && (
            <button onClick={() => unstuffContainer(inDevanning.id)} style={{background:'#10b981',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer'}}>📦 Unstuff</button>
          )}
          {inUnstuffed && (
            <button onClick={() => { onClose(); setShowLoadoutModal(true) }} style={{background:'#1e6f3f',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer'}}>📋 Clearance</button>
          )}
        </div>
        
        <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
          <button className="btn btn-outline" onClick={onClose} style={{
            background: getColor(isDarkMode, 'white', '#1e293b'),
            border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`,
            borderRadius: '40px',
            padding: '5px 12px',
            fontWeight: '600',
            fontSize: '0.7rem',
            cursor: 'pointer',
            color: getColor(isDarkMode, '#1e293b', '#e2e8f0'),
            width: '100%'
          }}>Close</button>
        </div>
      </div>
    </div>
  )
}
