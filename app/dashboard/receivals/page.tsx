"use client"
import React, { useState } from 'react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useToast } from '@/hooks/useToast'
import { useData } from '@/hooks/useData'
import ReceivalsTab from '@/app/dashboard/components/ReceivalsTab'

export default function ReceivalsPage() {
  const { isDarkMode } = useDarkMode()
  const { showToast } = useToast()
  const { containers, fetchAllData } = useData()
  const [selectedContainer, setSelectedContainer] = useState(null)
  const [showContainerDetailModal, setShowContainerDetailModal] = useState(false)

  return (
    <ReceivalsTab
      containers={containers}
      isDarkMode={isDarkMode}
      showToast={showToast}
      setSelectedContainer={setSelectedContainer}
      setShowContainerDetailModal={setShowContainerDetailModal}
      fetchAllData={fetchAllData}
    />
  )
}
