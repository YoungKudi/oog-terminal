import React from "react"
import React from "react"
'use client'
import React, { useState } from 'react'
import { getColor } from '@/lib/utils'

interface ScannerModalProps {
  onClose: () => void
  isDarkMode: boolean
  container: any
  scannedDocuments: any
  setScannedDocuments: (docs: any) => void
  showToast: (msg: string) => void
}

export default function ScannerModal({ onClose, isDarkMode, container, scannedDocuments, setScannedDocuments, showToast }: ScannerModalProps) {
  const [docType, setDocType] = useState('waybill')
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return
    const file = e.target.files[0]
    if (!container) return
    
    const docs = scannedDocuments[container.containerNumber] || []
    docs.push({
      name: file.name,
      type: docType,
      size: file.size,
      uploadedAt: new Date().toISOString()
    })
    
    const newDocs = { ...scannedDocuments, [container.containerNumber]: docs }
    setScannedDocuments(newDocs)
    localStorage.setItem('oog_scans', JSON.stringify(newDocs))
    showToast('✅ ' + file.name + ' attached to ' + container.containerNumber)
    onClose()
  }

  const removeDoc = (idx: number) => {
    if (!container) return
    const docs = scannedDocuments[container.containerNumber] || []
    docs.splice(idx, 1)
    const newDocs = { ...scannedDocuments }
    if (docs.length === 0) {
      delete newDocs[container.containerNumber]
    } else {
      newDocs[container.containerNumber] = docs
    }
    setScannedDocuments(newDocs)
    localStorage.setItem('oog_scans', JSON.stringify(newDocs))
    showToast('🗑️ Document removed')
    // Force re-render
    window.dispatchEvent(new Event('storage'))
  }

  const docs = container ? scannedDocuments[container.containerNumber] || [] : []

  return (
    <div className="modal" style={{display:'flex', position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', justifyContent:'center', alignItems:'center', zIndex:1000}}>
      <div className="modal-content" style={{background: getColor(isDarkMode, 'white', '#1e293b'), color: getColor(isDarkMode, "#1e293b", "#e2e8f0")}}>
        <h3 style={{color: getColor(isDarkMode, "#1e293b", "#e2e8f0"), marginBottom:'10px'}}>📷 Scan Document</h3>
        <div style={{marginBottom:'10px', fontSize:'0.8rem', fontWeight:'600', color: getColor(isDarkMode, "#1e293b", "#e2e8f0")}}>
          Container: {container?.containerNumber}
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: getColor(isDarkMode, "#1e293b", "#e2e8f0"), fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Document Type</label>
          <select value={docType} onChange={(e) => setDocType(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: getColor(isDarkMode, 'white', '#0a0e17'), color: getColor(isDarkMode, "#1e293b", "#e2e8f0")}}>
            <option value="waybill">Waybill</option>
            <option value="bill_of_lading">Bill of Lading</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="scanner-area" style={{border:'2px dashed #cbd5e1',borderRadius:'12px',padding:'20px',textAlign:'center',margin:'8px 0',cursor:'pointer',transition:'all 0.3s'}}>
          <span className="material-symbols-outlined" style={{fontSize:'3rem',color:'#94a3b8'}}>scan</span>
          <p style={{fontSize:'0.75rem',color: getColor(isDarkMode, "#1e293b", "#e2e8f0")}}>Click to scan or upload document</p>
          <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} style={{display:'none'}} id="scanFileInput" />
          <button onClick={() => document.getElementById('scanFileInput')?.click()} style={{background:'#1e6f3f',color:'white',border:'none',borderRadius:'40px',padding:'5px 12px',fontWeight:'600',fontSize:'0.7rem',cursor:'pointer'}}>📤 Upload File</button>
        </div>
        <div style={{marginTop:'8px'}}>
          {docs.length === 0 ? (
            <div style={{textAlign:'center',padding:'8px',color:'#94a3b8',fontSize:'0.7rem'}}>No documents attached</div>
          ) : (
            docs.map((d: any, idx: number) => (
              <div key={idx} className="scanned-doc" style={{display:'flex',alignItems:'center',gap:'8px',padding:'6px 10px',background: getColor(isDarkMode, '#f1f5f9', '#1a1f2e'),borderRadius:'8px',margin:'4px 0'}}>
                <span className="material-symbols-outlined" style={{fontSize:'1.2rem',color:'#10b981'}}>description</span>
                <span className="doc-name" style={{flex:1,fontSize:'0.75rem',color: getColor(isDarkMode, "#1e293b", "#e2e8f0")}}>{d.type}: {d.name}</span>
                <button onClick={() => removeDoc(idx)} style={{background:'#dc2626',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer'}}>✕</button>
              </div>
            ))
          )}
        </div>
        <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
          <button className="btn btn-outline" onClick={onClose} style={{background:'white',border:'1.5px solid #cbd5e1',borderRadius:'40px',padding:'5px 12px',fontWeight:'600',fontSize:'0.7rem',cursor:'pointer', width:'100%'}}>Close</button>
        </div>
      </div>
    </div>
  )
}
