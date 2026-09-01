"use client"
import React from 'react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useToast } from '@/hooks/useToast'
import ClearanceTab from '@/app/dashboard/components/ClearanceTab'

export default function ClearancePage() {
  const { isDarkMode } = useDarkMode()
  const { showToast } = useToast()

  const fetchAllData = async () => {
    // Refresh clearance data
    window.location.reload()
  }

  return (
    <ClearanceTab
      isDarkMode={isDarkMode}
      showToast={showToast}
      fetchAllData={fetchAllData}
    />
  )
}
