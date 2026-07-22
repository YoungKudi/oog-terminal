"use client"
import React from 'react'

interface DevanningWizardProps {
  container: any
  onClose: () => void
  onComplete: () => void
  showToast: (msg: string, type: string) => void
}

export default function DevanningWizard({ container, onClose }: DevanningWizardProps) {
  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '12px', maxWidth: '600px', width: '90%' }}>
      <h2>Devanning Wizard</h2>
      <p>Container: {container?.containerNumber}</p>
      <button onClick={onClose}>Close</button>
    </div>
  )
}
