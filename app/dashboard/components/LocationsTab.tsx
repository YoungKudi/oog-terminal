import React from 'react'
import { getColor } from '@/lib/utils'

interface LocationsTabProps {
  locations: any[]
  containers: any[]
  isDarkMode: boolean
  showToast: (msg: string) => void
  setLocations: (locs: any[]) => void
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
  const deleteLocation = (locId: string) => {
    const loc = locations.find(l => l.id === locId)
    if (!loc) { showToast('❌ Location not found'); return }
    const containerCount = containers.filter(c => loc.positions?.includes(c.position)).length
    if (containerCount > 0) {
      showToast(`❌ Cannot delete: ${containerCount} containers still in this location`)
      return
    }
    if (!confirm('Delete location "' + loc.name + '"? This cannot be undone.')) return
    const savedLocs = JSON.parse(localStorage.getItem('oog_locations') || '[]')
    const idx = savedLocs.findIndex(l => l.id === locId)
    if (idx !== -1) {
      savedLocs.splice(idx, 1)
      localStorage.setItem('oog_locations', JSON.stringify(savedLocs))
    }
    setLocations(locations.filter(l => l.id !== locId))
    showToast('🗑️ Location "' + loc.name + '" deleted')
  }

  return (
    <div className="card" style={{background: getColor(isDarkMode, 'white', '#111827'), borderRadius:'16px', marginBottom:'14px', border: getColor(isDarkMode, '1px solid #eef2f6', '1px solid #1f2937')}}>
      <div className="list-header" style={{background: getColor(isDarkMode, '#fefce8', '#0f172a'), borderRadius:'16px 16px 0 0', padding:'8px 14px', borderBottom: getColor(isDarkMode, '2px solid #eab308', '2px solid #8b5cf6'), display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'6px', color: getColor(isDarkMode, '#1e293b', '#f1f5f9')}}>
        <span>📍 Manage Locations</span>
        <button className="btn-primary btn-sm" onClick={() => setShowAddLocationModal(true)} style={{background:'#1e6f3f',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer'}}>+ Add Location</button>
      </div>
      <div className="card-body" style={{padding:'10px 14px'}}>
        <div>
          {locations.map(loc => {
            const count = containers.filter(c => loc.positions?.includes(c.position)).length
            return (
              <div key={loc.id} className="location-item" style={{background: getColor(isDarkMode, '#f8fafc', '#1e293b'), border: `1px solid ${getColor(isDarkMode, '#e2e8f0', '#334155')}`, padding:'8px 12px', borderRadius:'10px', marginBottom:'6px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'4px'}}>
                <div>
                  <span className="loc-name" style={{fontWeight:'600',fontSize:'0.85rem',color: getColor(isDarkMode, '#1e293b', '#e2e8f0')}}>📍 {loc.name}</span>
                  <span className="loc-details" style={{fontSize:'0.7rem',color: getColor(isDarkMode, '#64748b', '#94a3b8')}}> {loc.positions?.length || 0} positions | {count} containers</span>
                  <span style={{fontSize:'0.6rem',color: getColor(isDarkMode, '#64748b', '#94a3b8')}}> ({loc.type || 'grid'})</span>
                </div>
                <div style={{display:'flex',gap:'4px'}}>
                  <button className="btn-danger btn-sm" onClick={() => deleteLocation(loc.id)} style={{background:'#dc2626',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer'}}>🗑️</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

