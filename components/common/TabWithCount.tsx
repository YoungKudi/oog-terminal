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
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 480)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <button
      onClick={onClick}
      style={{
        flex: '1 0 auto',
        padding: '6px 4px',
        background: 'transparent',
        border: 'none',
        fontWeight: '600',
        fontSize: isMobile ? '0.5rem' : '0.6rem',
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
          fontSize: isMobile ? '1rem' : '1.1rem',
          lineHeight: 1
        }}>{icon}</span>
        <span style={{ 
          fontSize: isMobile ? '0.45rem' : '0.55rem',
          marginTop: '0px',
          display: isMobile ? 'none' : 'inline'
        }}>{label}</span>
        {/* Red dot badge - shows when count > 0 */}
        {count > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-4px',
              width: '10px',
              height: '10px',
              background: '#ef4444',
              borderRadius: '50%',
              boxShadow: '0 0 0 2px ' + (isDarkMode ? '#111827' : 'white'),
              animation: 'pulse-dot 1.5s ease-in-out infinite',
            }}
          />
        )}
      </div>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.9); }
        }
      `}</style>
    </button>
  )
}
