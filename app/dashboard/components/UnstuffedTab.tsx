"use client"
import React from 'react'

interface UnstuffedTabProps {
  unstuffedContainers: any[]
  isDarkMode: boolean
  showToast: (msg: string, type: string) => void
  fetchAllData: () => void
  selectedEvacContainer: any
  setSelectedEvacContainer: (container: any) => void
  evacuationSelectionMode: boolean
  setEvacuationSelectionMode: (mode: boolean) => void
  setSelectedContainer: (container: any) => void
  setShowContainerDetailModal: (show: boolean) => void
  setShowLoadoutModal: (show: boolean) => void
  setShowScannerModal: (show: boolean) => void
}

export default function UnstuffedTab({ unstuffedContainers, isDarkMode }: UnstuffedTabProps) {
  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Unstuffed Containers</h2>
      <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
        {unstuffedContainers?.length || 0} containers unstuffed
      </p>
    </div>
  )
}
