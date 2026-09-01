"use client"
import React from 'react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useToast } from '@/hooks/useToast'
import { useData } from '@/hooks/useData'
import QueueTab from '@/app/dashboard/components/QueueTab'

export default function QueuePage() {
  const { isDarkMode } = useDarkMode()
  const { showToast } = useToast()
  const { importQueue, fetchAllData } = useData()

  return (
    <QueueTab
      importQueue={importQueue}
      isDarkMode={isDarkMode}
      showToast={showToast}
      fetchAllData={fetchAllData}
    />
  )
}
