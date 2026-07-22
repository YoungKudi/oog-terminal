"use client"
import React from 'react'

interface EvacuationTabProps {
  evacuationRecords: any[]
  isDarkMode: boolean
  showToast: (msg: string, type: string) => void
  fetchAllData: () => void
}

export default function EvacuationTab({ 
  evacuationRecords, 
  isDarkMode, 
  showToast, 
  fetchAllData 
}: EvacuationTabProps) {
  // Simple rendering for now
  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Evacuation Records</h2>
      <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
        {evacuationRecords?.length || 0} containers evacuated
      </p>
    </div>
  )
}
