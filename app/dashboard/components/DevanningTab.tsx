"use client"
import React from 'react'

interface DevanningTabProps {
  devanningQueue: any[]
  isDarkMode: boolean
  showToast: (msg: string, type: string) => void
  fetchAllData: () => void
  setShowWizard: (show: boolean) => void
  setWizardContainer: (container: any) => void
  setSelectedContainer: (container: any) => void
  setShowContainerDetailModal: (show: boolean) => void
}

export default function DevanningTab({ devanningQueue, isDarkMode }: DevanningTabProps) {
  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Devanning Queue</h2>
      <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
        {devanningQueue?.length || 0} containers in devanning
      </p>
    </div>
  )
}
