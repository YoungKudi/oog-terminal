"use client"
import React, { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useData } from '@/hooks/useData'
import { useToast } from '@/hooks/useToast'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useTabCounts } from '@/hooks/useTabCounts'
import { getColor } from '@/lib/utils'
import { TabWithCount } from '@/components/common/TabWithCount'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { StatsGrid } from '@/components/common/StatsGrid'
import { DailyTally } from '@/components/common/DailyTally'
import { FloatingButtons } from '@/components/common/FloatingButtons'

// Import tab components
import QueueTab from './components/QueueTab'
import ReceivalsTab from './components/ReceivalsTab'
import TalliesTab from './components/TalliesTab'
import DevanningTab from './components/DevanningTab'
import UnstuffedTab from './components/UnstuffedTab'
import EvacuationTab from './components/EvacuationTab'
import LocationsTab from './components/LocationsTab'
import ContactsTab from './components/ContactsTab'
import BackupTab from './components/BackupTab'
import ReportsTab from './components/ReportsTab'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const tabCounts = useTabCounts()
  const [activeTab, setActiveTab] = useState('queue')

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    )
  }

  if (!session) {
    router.push('/login')
    return null
  }

  const tabs = [
    { id: 'queue', icon: '📥', label: 'Queue', count: tabCounts.queue },
    { id: 'receivals', icon: '📦', label: 'Receivals', count: tabCounts.receivals },
    { id: 'tallies', icon: '📋', label: 'Tallies', count: tabCounts.tallies },
    { id: 'devanning', icon: '🔧', label: 'Devanning', count: tabCounts.devanning },
    { id: 'unstuffed', icon: '✅', label: 'Unstuffed', count: tabCounts.unstuffed }
  ]

  return (
    <div style={{ minHeight: '100vh', background: isDarkMode ? '#0f172a' : '#f1f5f9' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '12px 20px', 
        background: isDarkMode ? '#1e293b' : '#ffffff',
        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
      }}>
        <h1 style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b', fontSize: '1.2rem' }}>
          🚢 OOG Terminal
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <NotificationBell />
          <span style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '0.8rem' }}>
            {session.user?.userId}
          </span>
          <button 
            onClick={toggleDarkMode}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button 
            onClick={() => signOut()}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Tab Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '2px', 
        padding: '8px 12px', 
        background: isDarkMode ? '#0f172a' : '#ffffff',
        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
        overflowX: 'auto'
      }}>
        {tabs.map(t => (
          <TabWithCount
            key={t.id}
            icon={t.icon}
            label={t.label}
            count={t.count}
            isActive={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: '16px' }}>
        {activeTab === 'queue' && (
          <QueueTab importQueue={[]} isDarkMode={isDarkMode} showToast={() => {}} fetchAllData={() => {}} />
        )}
        {activeTab === 'receivals' && (
          <ReceivalsTab containers={[]} isDarkMode={isDarkMode} showToast={() => {}} setSelectedContainer={() => {}} setShowContainerDetailModal={() => {}} fetchAllData={() => {}} />
        )}
        {activeTab === 'tallies' && (
          <TalliesTab containers={[]} locations={[]} allPositions={[]} isDarkMode={isDarkMode} showToast={() => {}} fetchAllData={() => {}} setSelectedContainer={() => {}} setShowContainerDetailModal={() => {}} setShowEditModal={() => {}} setShowRepositionModal={() => {}} />
        )}
        {activeTab === 'devanning' && (
          <DevanningTab devanningQueue={[]} isDarkMode={isDarkMode} showToast={() => {}} fetchAllData={() => {}} setShowWizard={() => {}} setWizardContainer={() => {}} setSelectedContainer={() => {}} setShowContainerDetailModal={() => {}} />
        )}
        {activeTab === 'unstuffed' && (
          <UnstuffedTab unstuffedContainers={[]} isDarkMode={isDarkMode} showToast={() => {}} fetchAllData={() => {}} selectedEvacContainer={null} setSelectedEvacContainer={() => {}} evacuationSelectionMode={false} setEvacuationSelectionMode={() => {}} setSelectedContainer={() => {}} setShowContainerDetailModal={() => {}} setShowLoadoutModal={() => {}} setShowScannerModal={() => {}} />
        )}
        {activeTab === 'evacuation' && (
          <EvacuationTab evacuationRecords={[]} isDarkMode={isDarkMode} showToast={() => {}} fetchAllData={() => {}} />
        )}
        {activeTab === 'locations' && (
          <LocationsTab locations={[]} containers={[]} isDarkMode={isDarkMode} showToast={() => {}} setLocations={() => {}} setShowAddLocationModal={() => {}} />
        )}
        {activeTab === 'contacts' && (
          <ContactsTab shiftData={{}} setShiftData={() => {}} isDarkMode={isDarkMode} session={session} showToast={() => {}} />
        )}
        {activeTab === 'backup' && (
          <BackupTab containers={[]} importQueue={[]} devanningQueue={[]} unstuffedContainers={[]} evacuationRecords={[]} loadingRecords={[]} scannedDocuments={{}} locations={[]} shiftData={{}} isDarkMode={isDarkMode} showToast={() => {}} fetchAllData={() => {}} />
        )}
        {activeTab === 'reports' && (
          <ReportsTab loadingRecords={[]} isDarkMode={isDarkMode} showToast={() => {}} />
        )}
      </div>
    </div>
  )
}
