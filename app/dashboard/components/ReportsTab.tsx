"use client"
import React from 'react'

interface ReportsTabProps {
  loadingRecords: any[]
  isDarkMode: boolean
  showToast: (msg: string, type: string) => void
}

export default function ReportsTab({ 
  loadingRecords,
  isDarkMode,
  showToast
}: ReportsTabProps) {
  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Reports</h2>
      <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
        {loadingRecords?.length || 0} loadout records
      </p>
    </div>
  )
}
