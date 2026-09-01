"use client"
import React, { useState } from 'react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useToast } from '@/hooks/useToast'
import { useData } from '@/hooks/useData'
import UnstuffedTab from '@/app/dashboard/components/UnstuffedTab'

export default function UnstuffedPage() {
  const { isDarkMode } = useDarkMode()
  const { showToast } = useToast()
  const { unstuffedContainers, fetchAllData } = useData()
  const [selectedEvacContainer, setSelectedEvacContainer] = useState(null)
  const [evacuationSelectionMode, setEvacuationSelectionMode] = useState(false)
  const [selectedContainer, setSelectedContainer] = useState(null)
  const [showContainerDetailModal, setShowContainerDetailModal] = useState(false)
  const [showLoadoutModal, setShowLoadoutModal] = useState(false)
  const [showScannerModal, setShowScannerModal] = useState(false)

  const handleClearanceProcessed = () => {
    fetchAllData()
  }

  return (
    <UnstuffedTab
      unstuffedContainers={unstuffedContainers}
      isDarkMode={isDarkMode}
      showToast={showToast}
      fetchAllData={fetchAllData}
      selectedEvacContainer={selectedEvacContainer}
      setSelectedEvacContainer={setSelectedEvacContainer}
      evacuationSelectionMode={evacuationSelectionMode}
      setEvacuationSelectionMode={setEvacuationSelectionMode}
      setSelectedContainer={setSelectedContainer}
      setShowContainerDetailModal={setShowContainerDetailModal}
      setShowLoadoutModal={setShowLoadoutModal}
      setShowScannerModal={setShowScannerModal}
      onClearanceProcessed={handleClearanceProcessed}
    />
  )
}
