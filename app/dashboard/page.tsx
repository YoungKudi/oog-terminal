
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
    return <div>Loading...</div>
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#1e293b', color: 'white' }}>
        <h1>🚢 OOG Terminal</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <NotificationBell />
          <span>{session.user?.userId}</span>
          <button onClick={toggleDarkMode}>{isDarkMode ? '☀️' : '🌙'}</button>
          <button onClick={() => signOut()}>Logout</button>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '4px', padding: '8px', background: '#f1f5f9', overflowX: 'auto' }}>
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

      <div style={{ padding: '16px' }}>
        {activeTab === 'queue' && <QueueTab importQueue={[]} isDarkMode={isDarkMode} showToast={() => {}} fetchAllData={() => {}} />}
        {activeTab === 'receivals' && <ReceivalsTab containers={[]} isDarkMode={isDarkMode} showToast={() => {}} setSelectedContainer={() => {}} setShowContainerDetailModal={() => {}} fetchAllData={() => {}} />}
        {activeTab === 'tallies' && <TalliesTab containers={[]} locations={[]} allPositions={[]} isDarkMode={isDarkMode} showToast={() => {}} fetchAllData={() => {}} setSelectedContainer={() => {}} setShowContainerDetailModal={() => {}} setShowEditModal={() => {}} setShowRepositionModal={() => {}} />}
        {activeTab === 'devanning' && <DevanningTab devanningQueue={[]} isDarkMode={isDarkMode} showToast={() => {}} fetchAllData={() => {}} setShowWizard={() => {}} setWizardContainer={() => {}} setSelectedContainer={() => {}} setShowContainerDetailModal={() => {}} />}
        {activeTab === 'unstuffed' && <UnstuffedTab unstuffedContainers={[]} isDarkMode={isDarkMode} showToast={() => {}} fetchAllData={() => {}} selectedEvacContainer={null} setSelectedEvacContainer={() => {}} evacuationSelectionMode={false} setEvacuationSelectionMode={() => {}} setSelectedContainer={() => {}} setShowContainerDetailModal={() => {}} setShowLoadoutModal={() => {}} setShowScannerModal={() => {}} />}
        {activeTab === 'evacuation' && <EvacuationTab evacuationRecords={[]} isDarkMode={isDarkMode} showToast={() => {}} fetchAllData={() => {}} />}
        {activeTab === 'locations' && <LocationsTab locations={[]} containers={[]} isDarkMode={isDarkMode} showToast={() => {}} setLocations={() => {}} setShowAddLocationModal={() => {}} />}
        {activeTab === 'contacts' && <ContactsTab shiftData={{}} setShiftData={() => {}} isDarkMode={isDarkMode} session={session} showToast={() => {}} />}
        {activeTab === 'backup' && <BackupTab containers={[]} importQueue={[]} devanningQueue={[]} unstuffedContainers={[]} evacuationRecords={[]} loadingRecords={[]} scannedDocuments={{}} locations={[]} shiftData={{}} isDarkMode={isDarkMode} showToast={() => {}} fetchAllData={() => {}} />}
        {activeTab === 'reports' && <ReportsTab loadingRecords={[]} isDarkMode={isDarkMode} showToast={() => {}} />}
      </div>
    </div>
  )
}
