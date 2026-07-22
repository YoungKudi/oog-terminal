"use client"
import React from 'react'

interface ReceivalsTabProps {
  containers: any[]
  isDarkMode: boolean
  showToast: (msg: string, type: string) => void
  setSelectedContainer: (container: any) => void
  setShowContainerDetailModal: (show: boolean) => void
  fetchAllData: () => void
}

export default function ReceivalsTab({ containers, isDarkMode }: ReceivalsTabProps) {
  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Receivals</h2>
      <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
        {containers?.length || 0} containers received
      </p>
    </div>
  )
}
