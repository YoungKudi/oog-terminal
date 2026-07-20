"use client"
import React, { useState } from 'react'
import { getColor } from '@/lib/utils'
import ContactsModal from '@/components/modals/ContactsModal'

interface ContactsTabProps {
  shiftData: any
  setShiftData: (data: any) => void
  isDarkMode: boolean
  session: any
  showToast: (msg: string) => void
}

export default function ContactsTab({
  shiftData,
  setShiftData,
  isDarkMode,
  session,
  showToast
}: ContactsTabProps) {
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean
    shiftId: string
    type: 'supervisors' | 'operators'
  }>({
    isOpen: false,
    shiftId: 'A',
    type: 'supervisors'
  })

  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#64748b', '#94a3b8')
  const cardBg = getColor(isDarkMode, 'white', '#111827')
  const borderColor = getColor(isDarkMode, '#eef2f6', '#1f2937')
  const btnBg = getColor(isDarkMode, 'white', '#1e293b')
  const btnText = getColor(isDarkMode, '#1e293b', '#e2e8f0')

  const isOfficer = session?.user?.role === 'officer'

  const openModal = (shiftId: string, type: 'supervisors' | 'operators') => {
    setModalConfig({ isOpen: true, shiftId, type })
  }

  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false })
  }

  const handleSaveSupervisors = (supervisors: any[]) => {
    const shift = shiftData[modalConfig.shiftId]
    const newShift = { 
      ...shift, 
      supervisors: supervisors 
    }
    const newData = { ...shiftData, [modalConfig.shiftId]: newShift }
    setShiftData(newData)
    localStorage.setItem('oog_shifts', JSON.stringify(newData))
    showToast('✅ Shift ' + modalConfig.shiftId + ' supervisors updated')
    closeModal()
  }

  const handleSaveOperators = (operators: any[]) => {
    const shift = shiftData[modalConfig.shiftId]
    const newShift = { ...shift, operators: operators }
    const newData = { ...shiftData, [modalConfig.shiftId]: newShift }
    setShiftData(newData)
    localStorage.setItem('oog_shifts', JSON.stringify(newData))
    showToast('✅ Shift ' + modalConfig.shiftId + ' operators updated')
    closeModal()
  }

  return (
    <>
      <div className="card" style={{background: cardBg, borderRadius:'16px', marginBottom:'14px', border: `1px solid ${borderColor}`}}>
        <div className="list-header" style={{background: getColor(isDarkMode, '#fefce8', '#0f172a'), borderRadius:'16px 16px 0 0', padding:'8px 14px', borderBottom: `2px solid ${getColor(isDarkMode, '#eab308', '#8b5cf6')}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'6px', color: getColor(isDarkMode, '#1e293b', '#f1f5f9')}}>
          <span>📞 Equipment Contacts</span>
        </div>
        <div className="card-body" style={{padding:'10px 14px'}}>
          {['A','B','C','D'].map(shiftId => {
            const shift = shiftData[shiftId]
            return (
              <div key={shiftId} className="shift-view" style={{background: getColor(isDarkMode, '#f8fafc', '#1e293b'), border: `1px solid ${borderColor}`, borderRadius:'12px', padding:'10px 12px', marginBottom:'10px'}}>
                <div className="shift-title" style={{fontWeight:'700',fontSize:'0.9rem',color: textColor}}>🕐 Shift {shiftId}</div>
                <div className="supervisor-info" style={{fontSize:'0.75rem',color: mutedColor,marginBottom:'4px'}}>
                  👤 Supervisors: {shift.supervisors[0]?.name || 'Not Assigned'} ({shift.supervisors[0]?.contact || ''}) | 
                  {shift.supervisors[1]?.name || 'Not Assigned'} ({shift.supervisors[1]?.contact || ''})
                </div>
                <div style={{fontSize:'0.65rem',color: mutedColor,marginTop:'4px'}}>
                  🏗️ Operators ({shift.operators.length}):
                </div>
                <div style={{marginTop:'2px',maxHeight:'120px',overflowY:'auto',fontSize:'0.65rem'}}>
                  {shift.operators.map((op: any, idx: number) => (
                    <div key={idx} className="operator-row" style={{display:'flex',justifyContent:'space-between',padding:'2px 0',borderBottom:`1px solid ${borderColor}`,color: textColor}}>
                      {op.name} | {op.machine} | {op.contact}
                    </div>
                  ))}
                </div>
                {isOfficer && (
                  <div style={{marginTop:'6px',display:'flex',gap:'4px',flexWrap:'wrap'}}>
                    <button className="btn-outline btn-sm" onClick={() => openModal(shiftId, 'supervisors')} style={{
                      background: btnBg,
                      border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`,
                      borderRadius: '40px',
                      padding: '2px 8px',
                      fontWeight: '600',
                      fontSize: '0.6rem',
                      cursor: 'pointer',
                      color: btnText
                    }}>👤 Edit Supervisors</button>
                    <button className="btn-outline btn-sm" onClick={() => openModal(shiftId, 'operators')} style={{
                      background: btnBg,
                      border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`,
                      borderRadius: '40px',
                      padding: '2px 8px',
                      fontWeight: '600',
                      fontSize: '0.6rem',
                      cursor: 'pointer',
                      color: btnText
                    }}>🏗️ Edit Operators</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Contacts Modal */}
      <ContactsModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onSave={modalConfig.type === 'supervisors' ? handleSaveSupervisors : handleSaveOperators}
        isDarkMode={isDarkMode}
        shiftId={modalConfig.shiftId}
        type={modalConfig.type}
        currentData={modalConfig.isOpen ? shiftData[modalConfig.shiftId] : null}
        showToast={showToast}
      />
    </>
  )
}
