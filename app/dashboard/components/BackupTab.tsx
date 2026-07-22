"use client"
import React from 'react'

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
  showToast: (msg: string, type: string) => void
  fetchAllData: () => void
}

export default function BackupTab({ 
  containers, 
  importQueue,
  devanningQueue,
  unstuffedContainers,
  evacuationRecords,
  loadingRecords,
  isDarkMode,
  showToast,
  fetchAllData
}: BackupTabProps) {
  const totalItems = (containers?.length || 0) + (importQueue?.length || 0) + 
                    (devanningQueue?.length || 0) + (unstuffedContainers?.length || 0) +
                    (evacuationRecords?.length || 0) + (loadingRecords?.length || 0)
  
  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Backup & Activity</h2>
      <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
        Total records: {totalItems}
      </p>
    </div>
  )
}
