"use client"
import React from 'react'

interface LocationsTabProps {
  locations: any[]
  containers: any[]
  isDarkMode: boolean
  showToast: (msg: string, type: string) => void
  setLocations: (locations: any[]) => void
  setShowAddLocationModal: (show: boolean) => void
}

export default function LocationsTab({ 
  locations,
  containers,
  isDarkMode,
  showToast,
  setLocations,
  setShowAddLocationModal
}: LocationsTabProps) {
  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>Locations</h2>
      <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
        {locations?.length || 0} locations configured
      </p>
    </div>
  )
}
