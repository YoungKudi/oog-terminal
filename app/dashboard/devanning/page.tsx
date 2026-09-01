"use client"
import React, { useState } from 'react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useToast } from '@/hooks/useToast'
import { useData } from '@/hooks/useData'
import DevanningTab from '@/app/dashboard/components/DevanningTab'

export default function DevanningPage() {
  const { isDarkMode } = useDarkMode()
  const { showToast } = useToast()
  const { devanningQueue, fetchAllData } = useData()
  const [showWizard, setShowWizard] = useState(false)
  const [wizardContainer, setWizardContainer] = useState(null)
  const [selectedContainer, setSelectedContainer] = useState(null)
  const [showContainerDetailModal, setShowContainerDetailModal] = useState(false)

  return (
    <DevanningTab
      devanningQueue={devanningQueue}
      isDarkMode={isDarkMode}
      showToast={showToast}
      fetchAllData={fetchAllData}
      setShowWizard={setShowWizard}
      setWizardContainer={setWizardContainer}
      setSelectedContainer={setSelectedContainer}
      setShowContainerDetailModal={setShowContainerDetailModal}
    />
  )
}
