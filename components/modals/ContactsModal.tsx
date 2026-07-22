import React from "react"
"use client"
import React, { useState } from 'react'
import { getColor } from '@/lib/utils'
import { MACHINE_TYPES } from '@/lib/constants'

interface ContactsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  isDarkMode: boolean
  shiftId: string
  type: 'supervisors' | 'operators'
  currentData: any
  showToast: (msg: string) => void
}

export default function ContactsModal({
  isOpen,
  onClose,
  onSave,
  isDarkMode,
  shiftId,
  type,
  currentData,
  showToast
}: ContactsModalProps) {
  const [supervisors, setSupervisors] = useState(currentData?.supervisors || [
    { name: '', contact: '' },
    { name: '', contact: '' }
  ])
  const [operators, setOperators] = useState(currentData?.operators || [
    { name: '', contact: '', machine: '3 Tonner' }
  ])

  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#4b5563', '#94a3b8')
  const bgColor = getColor(isDarkMode, 'white', '#1e293b')
  const borderColor = getColor(isDarkMode, '#eef2f6', '#334155')
  const inputBg = getColor(isDarkMode, 'white', '#0a0e17')
  const inputText = getColor(isDarkMode, '#1e293b', '#e2e8f0')

  const addOperator = () => {
    setOperators([...operators, { name: '', contact: '', machine: '3 Tonner' }])
  }

  const removeOperator = (index: number) => {
    if (operators.length <= 1) {
      showToast('❌ Must have at least one operator')
      return
    }
    const newOperators = operators.filter((_, i) => i !== index)
    setOperators(newOperators)
  }

  const updateOperator = (index: number, field: string, value: string) => {
    const newOperators = [...operators]
    newOperators[index] = { ...newOperators[index], [field]: value }
    setOperators(newOperators)
  }

  const updateSupervisor = (index: number, field: string, value: string) => {
    const newSupervisors = [...supervisors]
    newSupervisors[index] = { ...newSupervisors[index], [field]: value }
    setSupervisors(newSupervisors)
  }

  const handleSubmit = () => {
    if (type === 'supervisors') {
      if (!supervisors[0].name || !supervisors[1].name) {
        showToast('❌ Please enter both supervisor names')
        return
      }
      onSave(supervisors)
    } else {
      const validOperators = operators.filter(op => op.name.trim() !== '')
      if (validOperators.length === 0) {
        showToast('❌ Please add at least one operator')
        return
      }
      onSave(operators)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal" style={{display:'flex', position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', justifyContent:'center', alignItems:'center', zIndex:1000}}>
      <div className="modal-content" style={{background: bgColor, color: textColor, borderRadius:'24px', padding:'24px', maxWidth:'500px', width:'92%', maxHeight:'80vh', overflowY:'auto', border: `1px solid ${borderColor}`}}>
        <h3 style={{color: textColor, marginBottom:'16px'}}>
          {type === 'supervisors' ? '👤 Edit Supervisors - Shift ' + shiftId : '🏗️ Edit Operators - Shift ' + shiftId}
        </h3>

        {type === 'supervisors' ? (
          // Supervisors Form
          <div>
            <div style={{marginBottom:'16px'}}>
              <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'4px'}}>Supervisor 1</label>
              <div style={{display:'flex', gap:'8px'}}>
                <input 
                  type="text" 
                  placeholder="Name" 
                  value={supervisors[0].name}
                  onChange={(e) => updateSupervisor(0, 'name', e.target.value)}
                  style={{flex:1, padding:'6px 8px', borderRadius:'8px', border:`1px solid ${borderColor}`, fontSize:'0.75rem', background: inputBg, color: inputText}}
                />
                <input 
                  type="text" 
                  placeholder="Contact" 
                  value={supervisors[0].contact}
                  onChange={(e) => updateSupervisor(0, 'contact', e.target.value)}
                  style={{flex:1, padding:'6px 8px', borderRadius:'8px', border:`1px solid ${borderColor}`, fontSize:'0.75rem', background: inputBg, color: inputText}}
                />
              </div>
            </div>
            <div style={{marginBottom:'16px'}}>
              <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'4px'}}>Supervisor 2</label>
              <div style={{display:'flex', gap:'8px'}}>
                <input 
                  type="text" 
                  placeholder="Name" 
                  value={supervisors[1].name}
                  onChange={(e) => updateSupervisor(1, 'name', e.target.value)}
                  style={{flex:1, padding:'6px 8px', borderRadius:'8px', border:`1px solid ${borderColor}`, fontSize:'0.75rem', background: inputBg, color: inputText}}
                />
                <input 
                  type="text" 
                  placeholder="Contact" 
                  value={supervisors[1].contact}
                  onChange={(e) => updateSupervisor(1, 'contact', e.target.value)}
                  style={{flex:1, padding:'6px 8px', borderRadius:'8px', border:`1px solid ${borderColor}`, fontSize:'0.75rem', background: inputBg, color: inputText}}
                />
              </div>
            </div>
          </div>
        ) : (
          // Operators Form
          <div>
            <div style={{marginBottom:'12px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <span style={{fontSize:'0.7rem', color: mutedColor}}>{operators.length} operator(s)</span>
              <button 
                onClick={addOperator}
                style={{
                  background: '#1e6f3f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '40px',
                  padding: '4px 12px',
                  fontWeight: '600',
                  fontSize: '0.6rem',
                  cursor: 'pointer'
                }}
              >
                + Add Operator
              </button>
            </div>
            {operators.map((op, index) => (
              <div key={index} style={{marginBottom:'12px', padding:'12px', background: getColor(isDarkMode, '#f8fafc', '#0f172a'), borderRadius:'8px', border: `1px solid ${borderColor}`}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
                  <span style={{fontSize:'0.6rem', fontWeight:'600', color: mutedColor}}>Operator {index + 1}</span>
                  <button 
                    onClick={() => removeOperator(index)}
                    style={{
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '40px',
                      padding: '2px 8px',
                      fontWeight: '600',
                      fontSize: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
                  <input 
                    type="text" 
                    placeholder="Operator Name" 
                    value={op.name}
                    onChange={(e) => updateOperator(index, 'name', e.target.value)}
                    style={{padding:'6px 8px', borderRadius:'8px', border:`1px solid ${borderColor}`, fontSize:'0.7rem', background: inputBg, color: inputText}}
                  />
                  <input 
                    type="text" 
                    placeholder="Contact" 
                    value={op.contact}
                    onChange={(e) => updateOperator(index, 'contact', e.target.value)}
                    style={{padding:'6px 8px', borderRadius:'8px', border:`1px solid ${borderColor}`, fontSize:'0.7rem', background: inputBg, color: inputText}}
                  />
                  <select 
                    value={op.machine}
                    onChange={(e) => updateOperator(index, 'machine', e.target.value)}
                    style={{padding:'6px 8px', borderRadius:'8px', border:`1px solid ${borderColor}`, fontSize:'0.7rem', background: inputBg, color: inputText}}
                  >
                    {MACHINE_TYPES.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{display:'flex', gap:'8px', marginTop:'16px', borderTop: `1px solid ${borderColor}`, paddingTop:'16px'}}>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            style={{
              background: '#1e6f3f',
              color: 'white',
              border: 'none',
              borderRadius: '40px',
              padding: '8px 16px',
              fontWeight: '600',
              fontSize: '0.7rem',
              cursor: 'pointer',
              flex: 1
            }}
          >
            💾 Save Changes
          </button>
          <button 
            className="btn btn-outline" 
            onClick={onClose}
            style={{
              background: getColor(isDarkMode, 'white', '#1e293b'),
              border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`,
              borderRadius: '40px',
              padding: '8px 16px',
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
