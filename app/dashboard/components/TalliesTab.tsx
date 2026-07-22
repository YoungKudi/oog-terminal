"use client"
import React from 'react'

interface TalliesTabProps {
  containers: any[]
  locations: any[]
  allPositions: string[]
  isDarkMode: boolean
  showToast: (msg: string, type: string) => void
  fetchAllData: () => void
  setSelectedContainer: (container: any) => void
  setShowContainerDetailModal: (show: boolean) => void
  setShowEditModal: (show: boolean) => void
  setShowRepositionModal: (show: boolean) => void
}

export default function TalliesTab({ 
  containers, 
  isDarkMode, 
  showToast,
  fetchAllData
}: TalliesTabProps) {
  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Tallies</h2>
      <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
        {containers?.length || 0} containers in stack
      </p>
    </div>
  )
}
