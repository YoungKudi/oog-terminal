"use client"
import React, { useState } from 'react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useToast } from '@/hooks/useToast'
import { useData } from '@/hooks/useData'
import { DEFAULT_LOCATIONS } from '@/lib/constants'
import TalliesTab from '@/app/dashboard/components/TalliesTab'

export default function TalliesPage() {
  const { isDarkMode } = useDarkMode()
  const { showToast } = useToast()
  const { containers, fetchAllData } = useData()
  const [locations] = useState(DEFAULT_LOCATIONS)
  const [allPositions] = useState([])
  const [selectedContainer, setSelectedContainer] = useState(null)
  const [showContainerDetailModal, setShowContainerDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRepositionModal, setShowRepositionModal] = useState(false)

  return (
    <TalliesTab
      containers={containers}
      locations={locations}
      allPositions={allPositions}
      isDarkMode={isDarkMode}
      showToast={showToast}
      fetchAllData={fetchAllData}
      setSelectedContainer={setSelectedContainer}
      setShowContainerDetailModal={setShowContainerDetailModal}
      setShowEditModal={setShowEditModal}
      setShowRepositionModal={setShowRepositionModal}
    />
  )
}
