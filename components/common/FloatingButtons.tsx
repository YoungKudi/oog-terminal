"use client"
import React, { useState } from 'react'
import { Icons } from '@/components/icons/Icons'

interface FloatingButtonsProps {
  setShowReceivalModal: (show: boolean) => void
  setShowDevanningModal: (show: boolean) => void
  setShowSearchModal: (show: boolean) => void
  activeTab: string
}

export function FloatingButtons({ 
  setShowReceivalModal, 
  setShowDevanningModal, 
  setShowSearchModal, 
  activeTab 
}: FloatingButtonsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleButtons = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div style={{ position: 'fixed', bottom: '80px', right: '16px', zIndex: 100 }}>
      {/* Main Button */}
      <button 
        onClick={toggleButtons}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#1e6f3f',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
        }}
      >
        <Icons.Add size={28} color="white" />
      </button>

      {/* Sub Buttons */}
      <div style={{
        position: 'absolute',
        bottom: '70px',
        right: '0',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.3s ease'
      }}>
        <button 
          onClick={() => { setShowReceivalModal(true); setIsOpen(false) }}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#1e6f3f',
            color: 'white',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Add Container"
        >
          <Icons.Add size={24} color="white" />
        </button>

        <button 
          onClick={() => { setShowDevanningModal(true); setIsOpen(false) }}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Devanning"
        >
          <Icons.Devanning size={24} color="white" />
        </button>

        <button 
          onClick={() => { setShowSearchModal(true); setIsOpen(false) }}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Search"
        >
          <Icons.Search size={24} color="white" />
        </button>

        {activeTab === 'tallies' && (
          <button 
            onClick={() => { document.getElementById('tallySearch')?.focus(); setIsOpen(false) }}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Tally Search"
          >
            <Icons.Search size={24} color="white" />
          </button>
        )}
      </div>
    </div>
  )
}
