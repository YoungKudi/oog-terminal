"use client"
import React, { useState, useEffect } from 'react'
import { getColor, formatDate } from '@/lib/utils'

interface ClearanceTabProps {
  isDarkMode: boolean
  showToast: (msg: string) => void
  fetchAllData: () => void
}

export default function ClearanceTab({
  isDarkMode,
  showToast,
  fetchAllData
}: ClearanceTabProps) {
  const [clearanceRecords, setClearanceRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [filteredRecords, setFilteredRecords] = useState<any[]>([])

  useEffect(() => {
    fetchClearanceRecords()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [clearanceRecords, searchTerm, dateFilter])

  const fetchClearanceRecords = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/loadout')
      if (res.ok) {
        const data = await res.json()
        setClearanceRecords(data || [])
      }
    } catch (error) {
      console.error('Error fetching clearance records:', error)
    }
    setLoading(false)
  }

  const filterRecords = () => {
    let filtered = [...clearanceRecords]

    // Filter by search term (container number)
    if (searchTerm) {
      const term = searchTerm.toUpperCase()
      filtered = filtered.filter(r => 
        r.containerNumber?.toUpperCase().includes(term)
      )
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter(r => {
        const recordDate = r.clearedAt?.split('T')[0] || ''
        return recordDate === dateFilter
      })
    }

    // Sort by most recent first
    filtered.sort((a, b) => {
      return new Date(b.clearedAt).getTime() - new Date(a.clearedAt).getTime()
    })

    setFilteredRecords(filtered)
  }

  const handleClearAll = async () => {
    if (!confirm('Clear all clearance records?')) return
    try {
      // This would need a bulk delete endpoint
      showToast('Clear all functionality coming soon')
    } catch (error) {
      showToast('❌ Failed to clear records')
    }
  }

  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#64748b', '#94a3b8')
  const cardBg = getColor(isDarkMode, 'white', '#111827')
  const borderColor = getColor(isDarkMode, '#eef2f6', '#1f2937')
  const inputBg = getColor(isDarkMode, 'white', '#1e293b')
  const inputText = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const btnBg = getColor(isDarkMode, 'white', '#1e293b')
  const btnText = getColor(isDarkMode, '#1e293b', '#e2e8f0')

  const today = new Date().toISOString().split('T')[0]
  const todayRecords = clearanceRecords.filter(r => r.clearedAt?.split('T')[0] === today)

  return (
    <div className="card" style={{ background: cardBg, borderRadius: '16px', marginBottom: '14px', border: `1px solid ${borderColor}` }}>
      <div className="list-header" style={{
        background: getColor(isDarkMode, '#fefce8', '#0f172a'),
        borderRadius: '16px 16px 0 0',
        padding: '8px 14px',
        borderBottom: `2px solid ${getColor(isDarkMode, '#eab308', '#8b5cf6')}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '6px',
        color: getColor(isDarkMode, '#1e293b', '#f1f5f9')
      }}>
        <span>📋 Clearance Records ({todayRecords.length} today)</span>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <button
            className="btn-outline btn-sm"
            onClick={fetchClearanceRecords}
            style={{
              background: btnBg,
              border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`,
              borderRadius: '40px',
              padding: '2px 8px',
              fontWeight: '600',
              fontSize: '0.6rem',
              cursor: 'pointer',
              color: btnText
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="card-body" style={{ padding: '10px 14px' }}>
        {/* Search and Filter */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="🔍 Search container number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 2,
              padding: '6px 10px',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              fontSize: '0.7rem',
              background: inputBg,
              color: inputText,
              minWidth: '150px'
            }}
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              fontSize: '0.7rem',
              background: inputBg,
              color: inputText,
              minWidth: '130px'
            }}
          />
          {dateFilter && (
            <button
              className="btn-outline btn-sm"
              onClick={() => setDateFilter('')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: `1px solid ${borderColor}`,
                background: 'transparent',
                fontSize: '0.6rem',
                cursor: 'pointer',
                color: mutedColor
              }}
            >
              ✕ Clear Date
            </button>
          )}
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '12px', fontSize: '0.65rem', color: mutedColor }}>
          <span>📦 Today: <strong style={{ color: textColor }}>{todayRecords.length}</strong></span>
          <span>📊 Total: <strong style={{ color: textColor }}>{filteredRecords.length}</strong></span>
          <span>📅 {new Date().toLocaleDateString()}</span>
        </div>

        {/* Records List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: mutedColor }}>Loading...</div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: mutedColor }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>📭</div>
            <p>No clearance records found</p>
            <p style={{ fontSize: '0.7rem' }}>Clear containers from Unstuffed tab to see them here</p>
          </div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {filteredRecords.map((record: any) => {
              const isToday = record.clearedAt?.split('T')[0] === today
              const units = record.isDouble ? 2 : 1

              return (
                <div
                  key={record.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    marginBottom: '4px',
                    background: isToday ? getColor(isDarkMode, '#f0fdf4', '#0f172a') : getColor(isDarkMode, '#ffffff', '#1a1f2e'),
                    borderRadius: '8px',
                    border: `1px solid ${isToday ? '#86efac' : borderColor}`
                  }}
                >
                  <div>
                    <span style={{ fontWeight: '600', fontSize: '0.8rem', color: textColor }}>
                      {record.containerNumber}
                    </span>
                    <span style={{ fontSize: '0.6rem', color: mutedColor, marginLeft: '8px' }}>
                      {record.equipment}
                    </span>
                    {record.isDouble && (
                      <span style={{ fontSize: '0.55rem', color: '#f59e0b', fontWeight: '600', marginLeft: '4px' }}>
                        2X
                      </span>
                    )}
                    <div style={{ fontSize: '0.6rem', color: mutedColor }}>
                      🚛 {record.truckPlate || 'N/A'} | 📍 {record.location || record.position}
                    </div>
                    <div style={{ fontSize: '0.55rem', color: mutedColor }}>
                      {record.clearedAt ? new Date(record.clearedAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span style={{
                      fontSize: '0.55rem',
                      background: isToday ? '#10b981' : '#6b7280',
                      color: 'white',
                      padding: '1px 10px',
                      borderRadius: '12px',
                      fontWeight: '600'
                    }}>
                      {isToday ? 'Today' : 'Past'}
                    </span>
                    {record.remarks && (
                      <span style={{ fontSize: '0.5rem', color: mutedColor }}>{record.remarks}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
