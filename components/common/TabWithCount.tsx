"use client"
import React from 'react'

interface TabWithCountProps {
  icon: React.ReactNode
  label: string
  count: number
  isActive: boolean
  onClick: () => void
  isDarkMode: boolean
}

export function TabWithCount({ icon, label, count, isActive, onClick, isDarkMode }: TabWithCountProps) {
  const isActiveStyle = isActive ? 'active' : ''
  
  return (
    <button
      onClick={onClick}
      className={`tab-button ${isActiveStyle}`}
      style={{
        flex: '1 0 auto',
        padding: '8px 6px',
        background: 'transparent',
        border: 'none',
        fontWeight: '600',
        fontSize: '0.6rem',
        color: isActive ? (isDarkMode ? '#8b5cf6' : '#1e6f3f') : (isDarkMode ? '#94a3b8' : '#5b6e8c'),
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        minWidth: '44px',
        position: 'relative',
        borderBottom: isActive ? (isDarkMode ? '2px solid #8b5cf6' : '2px solid #1e6f3f') : '2px solid transparent',
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px',
        position: 'relative'
      }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <span style={{ fontSize: '0.55rem', marginTop: '0px' }}>{label}</span>
        {count > 0 && (
          <span
            style={{
              background: isActive ? (isDarkMode ? '#8b5cf6' : '#1e6f3f') : (isDarkMode ? '#475569' : '#94a3b8'),
              color: 'white',
              borderRadius: '12px',
              padding: '1px 6px',
              fontSize: '0.5rem',
              fontWeight: '700',
              minWidth: '16px',
              textAlign: 'center',
              lineHeight: '1.4',
              marginLeft: '2px',
              transition: 'all 0.2s ease',
              boxShadow: isActive ? '0 2px 8px rgba(30,111,63,0.3)' : 'none',
            }}
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </div>
    </button>
  )
}
