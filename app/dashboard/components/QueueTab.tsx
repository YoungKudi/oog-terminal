"use client"
import React from 'react'

interface QueueTabProps {
  importQueue: any[]
  isDarkMode: boolean
  showToast: (msg: string, type: string) => void
  fetchAllData: () => void
}

export default function QueueTab({ importQueue, isDarkMode, showToast, fetchAllData }: QueueTabProps) {
  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Import Queue</h2>
      <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
        {importQueue?.length || 0} containers in queue
      </p>
    </div>
  )
}
