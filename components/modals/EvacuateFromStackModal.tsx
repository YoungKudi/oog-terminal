import React from "react"
"use client"
import React, { useState } from 'react'
import { getColor } from '@/lib/utils'
import { supabase } from '@/lib/db'

interface EvacuateFromStackModalProps {
  onClose: () => void
  onSave: () => void
  isDarkMode: boolean
  container: any
  showToast: (msg: string) => void
}

export default function EvacuateFromStackModal({
  onClose,
  onSave,
  isDarkMode,
  container,
  showToast
}: EvacuateFromStackModalProps) {
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState('')
  const [destination, setDestination] = useState('')

  const handleSubmit = async () => {
    if (!container) {
      showToast('❌ No container selected')
      return
    }

    setLoading(true)
    try {
      // Move container directly to evacuation
      const { data: evacData, error: evacError } = await supabase
        .from('EvacuationRecord')
        .insert({
          containerNumber: container.containerNumber,
          size: container.size,
          type: container.type,
          position: container.position,
          equipment: container.equipment,
          vessel: container.vessel || '',
          arrivalDate: container.arrivalDate || '',
          auxCargo: container.auxCargo || '',
          devanningType: 'direct_evacuation',
          notes: `Evacuated from stack. Reason: ${reason || 'Not specified'}. Destination: ${destination || 'Unknown'}`,
        })
        .select()
        .single()

      if (evacError) throw evacError

      // Remove from container stack
      const { error: deleteError } = await supabase
        .from('Container')
        .delete()
        .eq('id', container.id)

      if (deleteError) throw deleteError

      // Log activity
      await supabase
        .from('ActivityLog')
        .insert({
          action: 'EVACUATED_FROM_STACK',
          containerNumber: container.containerNumber,
          details: `Container evacuated directly from stack. Reason: ${reason || 'Not specified'}`,
        })

      showToast('🚚 Container evacuated from stack')
      onSave()
      onClose()
    } catch (error: any) {
      console.error('Error evacuating from stack:', error)
      showToast('❌ Failed to evacuate container')
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
        <h3 style={{color: textColor, marginBottom:'10px'}}>🚚 Evacuate from Stack</h3>
        
        <div style={{marginBottom:'10px', fontSize:'0.8rem', fontWeight:'600', color: textColor}}>
          Container: {container?.containerNumber}
          <br />
          <span style={{fontSize:'0.7rem', fontWeight:'normal', color: mutedColor}}>
            Position: {container?.position} | Equipment: {container?.equipment}
          </span>
        </div>

        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Evacuation Reason</label>
          <select 
            value={reason} 
            onChange={(e) => setReason(e.target.value)}
            style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}}
          >
            <option value="">Select reason...</option>
            <option value="damage">Damage</option>
            <option value="customer_request">Customer Request</option>
            <option value="wrong_location">Wrong Location</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Destination</label>
          <input 
            type="text" 
            value={destination} 
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Return to customer, Scrap, etc."
            style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}}
          />
        </div>

        <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
          <button 
            className="btn btn-warning" 
            onClick={handleSubmit} 
            disabled={loading}
            style={{background:'#f59e0b',color:'white',border:'none',borderRadius:'40px',padding:'5px 12px',fontWeight:'600',fontSize:'0.7rem',cursor: loading ? 'not-allowed' : 'pointer', flex:1}}
          >
            {loading ? 'Processing...' : '🚚 Evacuate'}
          </button>
          <button 
            className="btn btn-outline" 
            onClick={onClose}
            style={{
              background: getColor(isDarkMode, 'white', '#1e293b'),
              border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`,
              borderRadius: '40px',
              padding: '5px 12px',
              fontWeight: '600',
              fontSize: '0.7rem',
              cursor: 'pointer',
              color: getColor(isDarkMode, '#1e293b', '#e2e8f0')
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
