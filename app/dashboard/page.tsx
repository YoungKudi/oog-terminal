"use client"
import React, { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useData } from '@/hooks/useData'
import { useToast } from '@/hooks/useToast'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useTabCounts } from '@/hooks/useTabCounts'
import { DEFAULT_LOCATIONS, DEFAULT_SHIFT } from '@/lib/constants'
import { getColor } from '@/lib/utils'
import { Icons } from '@/components/icons/Icons'
import { TabWithCount } from '@/components/common/TabWithCount'

// Import all tab components
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
import DevanningWizard from './components/DevanningWizard'

// Import modals
import ReceivalModal from '@/components/modals/ReceivalModal'
import DevanningModal from '@/components/modals/DevanningModal'
import LoadoutModal from '@/components/modals/LoadoutModal'
import EditModal from '@/components/modals/EditModal'
import RepositionModal from '@/components/modals/RepositionModal'
import SearchModal from '@/components/modals/SearchModal'
import ContainerDetailModal from '@/components/modals/ContainerDetailModal'
import AddLocationModal from '@/components/modals/AddLocationModal'
import ScannerModal from '@/components/modals/ScannerModal'
import { StatsGrid } from '@/components/common/StatsGrid'
import { DailyTally } from '@/components/common/DailyTally'
import { FloatingButtons } from '@/components/common/FloatingButtons'
import { NotificationBell } from '@/components/notifications/NotificationBell'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const tabCounts = useTabCounts()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownButtonRef = useRef<HTMLButtonElement>(null)
  
  const {
    containers,
    importQueue,
    devanningQueue,
    unstuffedContainers,
    evacuationRecords,
    loadingRecords,
    activityLog,
    loading,
    fetchAllData
  } = useData()

  const [activeTab, setActiveTab] = useState('queue')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS)
  const [allPositions, setAllPositions] = useState([])
  const [shiftData, setShiftData] = useState({A: {...DEFAULT_SHIFT}, B: {...DEFAULT_SHIFT}, C: {...DEFAULT_SHIFT}, D: {...DEFAULT_SHIFT}})
  const [scannedDocuments, setScannedDocuments] = useState({})
  const [selectedEvacContainer, setSelectedEvacContainer] = useState(null)
  const [evacuationSelectionMode, setEvacuationSelectionMode] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const [wizardContainer, setWizardContainer] = useState(null)

  // Modal states
  const [showReceivalModal, setShowReceivalModal] = useState(false)
  const [showDevanningModal, setShowDevanningModal] = useState(false)
  const [showLoadoutModal, setShowLoadoutModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRepositionModal, setShowRepositionModal] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showContainerDetailModal, setShowContainerDetailModal] = useState(false)
  const [showAddLocationModal, setShowAddLocationModal] = useState(false)
  const [showScannerModal, setShowScannerModal] = useState(false)
  const [selectedContainer, setSelectedContainer] = useState(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const allPos = []
    for (const loc of locations) {
      if (loc.positions) allPos.push(...loc.positions)
    }
    setAllPositions(allPos.sort())
  }, [locations])

  useEffect(() => {
    const scans = localStorage.getItem('oog_scans')
    if (scans) setScannedDocuments(JSON.parse(scans))
    const savedShifts = localStorage.getItem('oog_shifts')
    if (savedShifts) setShiftData(JSON.parse(savedShifts))
  }, [])

  if (loading || status === 'loading') {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:'16px',background:isDarkMode?'#0a0e17':'#f5f7fb'}}>
        <div style={{width:'48px',height:'48px',border:'4px solid #e2e8f0',borderTop:'4px solid #1e6f3f',borderRadius:'50%',animation:'spin 1s linear infinite'}} />
        <p style={{color:isDarkMode?'#94a3b8':'#64748b',fontSize:'0.9rem'}}>Loading OOG Terminal...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!session) return null

  const switchToTab = (tabId: string) => {
    setActiveTab(tabId)
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'))
    const tabContent = document.getElementById(tabId + '-tab')
    if (tabContent) tabContent.classList.add('active')
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'))
    const tabButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`)
    if (tabButton) tabButton.classList.add('active')
    setDropdownOpen(false)
  }

  const handleTabClick = (tab: string) => {
    switchToTab(tab)
  }

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDropdownOpen(!dropdownOpen)
  }

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour >= 17 ? 'Good Evening' : hour >= 12 ? 'Good Afternoon' : 'Good Morning'
  const day = String(now.getDate()).padStart(2,'0')
  const month = String(now.getMonth()+1).padStart(2,'0')
  const year = now.getFullYear()
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const dayName = days[now.getDay()]
  const dateStr = `${day}/${month}/${year} ${dayName}`

  const tabs = [
    { id: 'queue', icon: '📥', label: 'Queue', count: tabCounts.queue },
    { id: 'receivals', icon: '📦', label: 'Receivals', count: tabCounts.receivals },
    { id: 'tallies', icon: '📋', label: 'Tallies', count: tabCounts.tallies },
    { id: 'devanning', icon: '🔧', label: 'Devanning', count: tabCounts.devanning },
    { id: 'unstuffed', icon: '✅', label: 'Unstuffed', count: tabCounts.unstuffed }
  ]

  return (
    <div className="app-container">
      {/* HEADER */}
      <div className="app-header">
        <div className="logo-area">
          <h1>
            <span style={{ display: 'inline-flex', marginRight: '8px' }}>
              <Icons.Dashboard size={20} color="white" />
            </span>
            OOG Terminal
          </h1>
        </div>
        <div className="header-actions">
          <NotificationBell />
          <span style={{fontSize:'0.75rem',opacity:0.8}}>👤 {session.user?.userId}</span>
          <button className="btn" onClick={toggleDarkMode} style={{background:'rgba(255,255,255,0.2)',padding:'2px 10px'}}>{isDarkMode ? '☀️' : '🌙'}</button>
        </div>
      </div>

      {/* TAB BAR */}
      <div className="tab-bar" style={{ overflow: 'visible', position: 'relative', zIndex: 10 }}>
        {tabs.map(t => (
          <TabWithCount
            key={t.id}
            icon={t.icon}
            label={t.label}
            count={t.count}
            isActive={activeTab === t.id}
            onClick={() => handleTabClick(t.id)}
            isDarkMode={isDarkMode}
          />
        ))}
        <div className="dropdown-container" ref={dropdownRef} style={{ position: 'relative', zIndex: 100 }}>
          <button 
            ref={dropdownButtonRef}
            className="dropdown-btn" 
            onClick={toggleDropdown}
            style={{
              background: dropdownOpen ? 'rgba(0,0,0,0.05)' : 'transparent',
              borderRadius: '8px',
              padding: '6px 10px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: '600',
              fontSize: '0.65rem',
              color: isDarkMode ? '#94a3b8' : '#5b6e8c',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>⚙️</span>
            <span>More</span>
            <span style={{ 
              fontSize: '0.7rem', 
              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}>▼</span>
          </button>
          <div 
            className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}
            style={{
              display: dropdownOpen ? 'block' : 'none',
              position: 'absolute',
              top: '100%',
              right: '0',
              background: isDarkMode ? '#1e293b' : 'white',
              border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
              borderRadius: '12px',
              minWidth: '200px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              zIndex: 9999,
              padding: '4px 0',
              marginTop: '4px',
              maxHeight: '400px',
              overflowY: 'auto'
            }}
          >
            <a 
              onClick={() => switchToTab('evacuation')} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                textDecoration: 'none',
                color: isDarkMode ? '#e2e8f0' : '#1e293b',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#2d3a5e' : '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '1rem' }}>🚚</span>
              Evacuation & Boxes ({tabCounts.evacuation})
            </a>
            <a 
              onClick={() => switchToTab('locations')} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                textDecoration: 'none',
                color: isDarkMode ? '#e2e8f0' : '#1e293b',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#2d3a5e' : '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '1rem' }}>📍</span>
              Locations
            </a>
            <a 
              onClick={() => switchToTab('contacts')} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                textDecoration: 'none',
                color: isDarkMode ? '#e2e8f0' : '#1e293b',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#2d3a5e' : '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '1rem' }}>👤</span>
              Equipment Contacts
            </a>
            <a 
              onClick={() => switchToTab('backup')} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                textDecoration: 'none',
                color: isDarkMode ? '#e2e8f0' : '#1e293b',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#2d3a5e' : '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '1rem' }}>💾</span>
              Backup & Activity
            </a>
            <a 
              onClick={() => switchToTab('reports')} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                textDecoration: 'none',
                color: isDarkMode ? '#e2e8f0' : '#1e293b',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#2d3a5e' : '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '1rem' }}>📄</span>
              Reports
            </a>
            <div className="dropdown-divider" style={{
              borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
              margin: '4px 0'
            }}></div>
            <a 
              onClick={() => { signOut({ callbackUrl: '/login' }) }} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                textDecoration: 'none',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer',
                color: '#dc2626',
                borderRadius: '4px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '1rem' }}>🚪</span>
              Sign Out
            </a>
          </div>
        </div>
      </div>

      {/* TABS CONTENT - Same as before */}
      <div className="tab-content active" id="queue-tab">
        <DailyTally 
          locations={locations} 
          containers={containers} 
          isDarkMode={isDarkMode}
          greeting={greeting}
          dateStr={dateStr}
        />
        <StatsGrid 
          containers={containers} 
          importQueue={importQueue} 
          devanningQueue={devanningQueue}
          isDarkMode={isDarkMode}
        />
        <QueueTab 
          importQueue={importQueue}
          isDarkMode={isDarkMode}
          showToast={showToast}
          fetchAllData={fetchAllData}
        />
      </div>

      <div className="tab-content" id="receivals-tab">
        <ReceivalsTab 
          containers={containers}
          isDarkMode={isDarkMode}
          showToast={showToast}
          setSelectedContainer={setSelectedContainer}
          setShowContainerDetailModal={setShowContainerDetailModal}
          fetchAllData={fetchAllData}
        />
      </div>

      <div className="tab-content" id="tallies-tab">
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
      </div>

      <div className="tab-content" id="devanning-tab">
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
      </div>

      <div className="tab-content" id="unstuffed-tab">
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
        />
      </div>

      <div className="tab-content" id="evacuation-tab">
        <EvacuationTab 
          evacuationRecords={evacuationRecords}
          isDarkMode={isDarkMode}
          showToast={showToast}
          fetchAllData={fetchAllData}
        />
      </div>

      <div className="tab-content" id="locations-tab">
        <LocationsTab 
          locations={locations}
          containers={containers}
          isDarkMode={isDarkMode}
          showToast={showToast}
          setLocations={setLocations}
          setShowAddLocationModal={setShowAddLocationModal}
        />
      </div>

      <div className="tab-content" id="contacts-tab">
        <ContactsTab 
          shiftData={shiftData}
          setShiftData={setShiftData}
          isDarkMode={isDarkMode}
          session={session}
          showToast={showToast}
        />
      </div>

      <div className="tab-content" id="backup-tab">
        <BackupTab 
          containers={containers}
          importQueue={importQueue}
          devanningQueue={devanningQueue}
          unstuffedContainers={unstuffedContainers}
          evacuationRecords={evacuationRecords}
          loadingRecords={loadingRecords}
          scannedDocuments={scannedDocuments}
          locations={locations}
          shiftData={shiftData}
          isDarkMode={isDarkMode}
          showToast={showToast}
          fetchAllData={fetchAllData}
        />
      </div>

      <div className="tab-content" id="reports-tab">
        <ReportsTab 
          loadingRecords={loadingRecords}
          isDarkMode={isDarkMode}
          showToast={showToast}
        />
      </div>

      {/* FLOATING BUTTONS */}
      <FloatingButtons 
        setShowReceivalModal={setShowReceivalModal}
        setShowDevanningModal={setShowDevanningModal}
        setShowSearchModal={setShowSearchModal}
        activeTab={activeTab}
      />

      {/* MODALS */}
      {showWizard && wizardContainer && (
        <div className="modal" style={{display:'flex', position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', justifyContent:'center', alignItems:'center', zIndex:1000}}>
          <DevanningWizard 
            container={wizardContainer}
            onClose={() => { setShowWizard(false); setWizardContainer(null) }}
            onComplete={fetchAllData}
            showToast={showToast}
          />
        </div>
      )}

      {showReceivalModal && (
        <ReceivalModal 
          onClose={() => setShowReceivalModal(false)}
          onSave={fetchAllData}
          isDarkMode={isDarkMode}
          allPositions={allPositions}
          showToast={showToast}
        />
      )}

      {showDevanningModal && (
        <DevanningModal 
          onClose={() => setShowDevanningModal(false)}
          onSave={fetchAllData}
          isDarkMode={isDarkMode}
          containers={containers}
          allPositions={allPositions}
          showToast={showToast}
        />
      )}

      {showLoadoutModal && (
        <LoadoutModal 
          onClose={() => setShowLoadoutModal(false)}
          onSave={fetchAllData}
          isDarkMode={isDarkMode}
          container={selectedContainer}
          unstuffedContainers={unstuffedContainers}
          showToast={showToast}
        />
      )}

      {showEditModal && (
        <EditModal 
          onClose={() => setShowEditModal(false)}
          onSave={fetchAllData}
          isDarkMode={isDarkMode}
          container={selectedContainer}
          containers={containers}
          allPositions={allPositions}
          showToast={showToast}
        />
      )}

      {showRepositionModal && (
        <RepositionModal 
          onClose={() => setShowRepositionModal(false)}
          onSave={fetchAllData}
          isDarkMode={isDarkMode}
          container={selectedContainer}
          allPositions={allPositions}
          showToast={showToast}
        />
      )}

      {showSearchModal && (
        <SearchModal 
          onClose={() => setShowSearchModal(false)}
          isDarkMode={isDarkMode}
          containers={containers}
          unstuffedContainers={unstuffedContainers}
          showToast={showToast}
        />
      )}

      {showContainerDetailModal && (
        <ContainerDetailModal 
          onClose={() => setShowContainerDetailModal(false)}
          isDarkMode={isDarkMode}
          container={selectedContainer}
          containers={containers}
          devanningQueue={devanningQueue}
          unstuffedContainers={unstuffedContainers}
          scannedDocuments={scannedDocuments}
          showToast={showToast}
          setShowScannerModal={setShowScannerModal}
          setShowEditModal={setShowEditModal}
          setShowDevanningModal={setShowDevanningModal}
          setShowLoadoutModal={setShowLoadoutModal}
          fetchAllData={fetchAllData}
        />
      )}

      {showAddLocationModal && (
        <AddLocationModal 
          onClose={() => setShowAddLocationModal(false)}
          onSave={fetchAllData}
          isDarkMode={isDarkMode}
          locations={locations}
          setLocations={setLocations}
          showToast={showToast}
        />
      )}

      {showScannerModal && (
        <ScannerModal 
          onClose={() => setShowScannerModal(false)}
          isDarkMode={isDarkMode}
          container={selectedContainer}
          scannedDocuments={scannedDocuments}
          setScannedDocuments={setScannedDocuments}
          showToast={showToast}
        />
      )}

      {/* FOOTER */}
      <div style={{textAlign:'center',fontSize:'0.65rem',color: getColor(isDarkMode, '#94a3b8', '#94a3b8'),padding:'12px 0',borderTop: getColor(isDarkMode, '1px solid #e2e8f0', '1px solid #1f2937'),marginTop:'16px',flexShrink:0}}>
        Developed by <strong>O'Bour Dev</strong> © 2026
      </div>
    </div>
  )
}
