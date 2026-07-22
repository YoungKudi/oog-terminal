"use client"
import React from 'react'

interface FloatingButtonsProps {
  setShowReceivalModal: (show: boolean) => void
  setShowDevanningModal: (show: boolean) => void
  setShowSearchModal: (show: boolean) => void
  activeTab: string
}

export function FloatingButtons({ setShowReceivalModal, setShowDevanningModal, setShowSearchModal, activeTab }: FloatingButtonsProps) {
  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button onClick={() => setShowReceivalModal(true)} style={{ background: '#1e6f3f', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>📦</button>
      <button onClick={() => setShowDevanningModal(true)} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>🔧</button>
      <button onClick={() => setShowSearchModal(true)} style={{ background: '#7c3aed', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>🔍</button>
    </div>
  )
}
