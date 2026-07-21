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
  const textColor = isActive ? '#1e6f3f' : '#5b6e8c'
  const bgColor = isActive ? '#f0fdf4' : 'transparent'
  const darkTextColor = isActive ? '#8b5cf6' : '#94a3b8'
  const darkBgColor = isActive ? '#1e1b2e' : 'transparent'

  return (
    <button
      onClick={onClick}
      style={{
        flex: '1 0 auto',
        padding: '6px 4px',
        background: isDarkMode ? darkBgColor : bgColor,
        border: 'none',
        fontWeight: '600',
        fontSize: '0.6rem',
        color: isDarkMode ? darkTextColor : textColor,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0px',
        borderRadius: '6px',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
        minWidth: '44px',
        position: 'relative'
      }}
    >
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      <span style={{ fontSize: '0.55rem', marginTop: '1px' }}>{label}</span>
      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: '#dc2626',
            color: 'white',
            borderRadius: '50%',
            padding: '1px 5px',
            fontSize: '0.5rem',
            fontWeight: 'bold',
            minWidth: '16px',
            textAlign: 'center'
          }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
