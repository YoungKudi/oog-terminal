"use client"
import React from 'react'
import { getColor } from '@/lib/utils'

interface RoleSelectorProps {
  selectedRole: 'staff' | 'casual' | null
  onChange: (role: 'staff' | 'casual') => void
  isDarkMode?: boolean
}

export default function RoleSelector({ selectedRole, onChange, isDarkMode = false }: RoleSelectorProps) {
  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#64748b', '#94a3b8')
  const borderColor = getColor(isDarkMode, '#d1d5db', '#475569')
  
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '8px', 
        fontWeight: '500', 
        fontSize: '0.75rem', 
        color: '#4b5563'
      }}>
        Worker Type <span style={{ color: '#dc2626' }}>*</span>
      </label>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '10px'
      }}>
        <button
          type="button"
          onClick={() => onChange('staff')}
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            border: `2px solid ${selectedRole === 'staff' ? '#1e6f3f' : borderColor}`,
            background: selectedRole === 'staff' ? getColor(isDarkMode, '#f0fdf4', '#0f172a') : getColor(isDarkMode, 'white', '#1e293b'),
            color: textColor,
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s',
            fontWeight: selectedRole === 'staff' ? '600' : '400'
          }}
        >
          <div style={{ fontSize: '1.5rem' }}>👔</div>
          <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>Staff</div>
          <div style={{ fontSize: '0.6rem', color: mutedColor }}>7 digits</div>
          <div style={{ fontSize: '0.5rem', color: mutedColor, marginTop: '2px' }}>e.g., 4567423</div>
        </button>
        
        <button
          type="button"
          onClick={() => onChange('casual')}
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            border: `2px solid ${selectedRole === 'casual' ? '#1e6f3f' : borderColor}`,
            background: selectedRole === 'casual' ? getColor(isDarkMode, '#f0fdf4', '#0f172a') : getColor(isDarkMode, 'white', '#1e293b'),
            color: textColor,
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s',
            fontWeight: selectedRole === 'casual' ? '600' : '400'
          }}
        >
          <div style={{ fontSize: '1.5rem' }}>🧑‍💼</div>
          <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>Casual</div>
          <div style={{ fontSize: '0.6rem', color: mutedColor }}>2 letters + 6 digits</div>
          <div style={{ fontSize: '0.5rem', color: mutedColor, marginTop: '2px' }}>e.g., TC246789</div>
        </button>
      </div>
    </div>
  )
}
