"use client"
import React from 'react'

interface ContactsTabProps {
  shiftData: any
  setShiftData: (data: any) => void
  isDarkMode: boolean
  session: any
  showToast: (msg: string, type: string) => void
}

export default function ContactsTab({ 
  shiftData,
  isDarkMode,
  session,
  showToast
}: ContactsTabProps) {
  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Equipment Contacts</h2>
      <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
        Shift data loaded
      </p>
    </div>
  )
}
