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
  return (
    <button
      onClick={onClick}
      style={{
        flex: '1 0 auto',
        padding: '6px 4px',
        background: 'transparent',
        border: 'none',
        fontWeight: '600',
        fontSize: window.innerWidth < 480 ? '0.5rem' : '0.6rem',
        color: isActive ? (isDarkMode ? '#8b5cf6' : '#1e6f3f') : (isDarkMode ? '#94a3b8' : '#5b6e8c'),
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1px',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        minWidth: '36px',
        position: 'relative',
        borderBottom: isActive ? (isDarkMode ? '2px solid #8b5cf6' : '2px solid #1e6f3f') : '2px solid transparent',
        flexShrink: 0,
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '2px',
        position: 'relative',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <span style={{ 
          fontSize: window.innerWidth < 480 ? '1rem' : '1.1rem',
          lineHeight: 1
        }}>{icon}</span>
        <span style={{ 
          fontSize: window.innerWidth < 480 ? '0.45rem' : '0.55rem',
          marginTop: '0px',
          display: window.innerWidth < 480 ? 'none' : 'inline'
        }}>{label}</span>
        {count > 0 && (
          <span
            style={{
              background: isActive ? (isDarkMode ? '#8b5cf6' : '#1e6f3f') : (isDarkMode ? '#475569' : '#94a3b8'),
              color: 'white',
              borderRadius: '12px',
              padding: '1px 4px',
              fontSize: window.innerWidth < 480 ? '0.4rem' : '0.5rem',
              fontWeight: '700',
              minWidth: '14px',
              textAlign: 'center',
              lineHeight: '1.4',
              marginLeft: '1px',
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
