"use client"
import React, { useState } from 'react'
import { getColor } from '@/lib/utils'
import { AUX_CARGO_TYPES } from '@/lib/constants'

interface ClearanceModalProps {
  isOpen: boolean
  onClose: () => void
  container: any
  isDarkMode: boolean
  showToast: (msg: string) => void
  onComplete: () => void
}

export default function ClearanceModal({
  isOpen,
  onClose,
  container,
  isDarkMode,
  showToast,
  onComplete
}: ClearanceModalProps) {
  const [truckPlate, setTruckPlate] = useState('')
  const [remarks, setRemarks] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen || !container) return null

  // Parse aux cargo
  const auxCargo = container.auxCargo || ''
  const cargoMatch = auxCargo.match(/(\d+)\s*(\w+)/)
  const cargoQty = cargoMatch ? parseInt(cargoMatch[1]) : 0
  const cargoType = cargoMatch ? cargoMatch[2] : 'units'

  const handleSubmit = async () => {
    if (!truckPlate) {
      showToast('❌ Please enter truck plate number')
      return
    }

    setLoading(true)
    try {
      const today = new Date().toISOString().slice(0, 10)
      
      const data = {
        containerNumber: container.containerNumber,
        size: container.size,
        type: container.type,
        equipment: container.equipment,
        vessel: container.vessel || '',
        arrivalDate: container.arrivalDate || '',
        unstuffedDate: container.unstuffedAt || today,
        deliveryDate: today,
        location: container.position,
        content: container.equipment,
        truckPlate: truckPlate.toUpperCase().trim(),
        agentContact: container.agency || '',
        boxesLoaded: container.auxCargoQuantity || 0,
        devanningType: container.devanningType || 'unstuffing',
        remarks: remarks || '',
        isDouble: container.isDouble || false,
        auxCargo: container.auxCargo || '',
        auxCargoType: container.auxCargoType || 'units',
        auxCargoQuantity: container.auxCargoQuantity || 0
      }

      // Send to loadout API
      const res = await fetch('/api/loadout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to process clearance')
      }

      // Remove from unstuffed
      await fetch('/api/unstuffed', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ containerNumber: container.containerNumber })
      })

      showToast(`✅ Container ${container.containerNumber} cleared successfully`)
      onComplete()
      onClose()
    } catch (error: any) {
      showToast('❌ ' + error.message)
    }
    setLoading(false)
  }

  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#4b5563', '#94a3b8')
  const bgColor = getColor(isDarkMode, 'white', '#1e293b')
  const borderColor = getColor(isDarkMode, '#eef2f6', '#334155')
  const inputBg = getColor(isDarkMode, 'white', '#0a0e17')
  const inputText = getColor(isDarkMode, '#1e293b', '#e2e8f0')

  return (
    <div className="modal" style={{
      display: 'flex',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        background: bgColor,
        color: textColor,
        borderRadius: '24px',
        padding: '24px',
        maxWidth: '480px',
        width: '92%',
        maxHeight: '80vh',
        overflowY: 'auto',
        border: `1px solid ${borderColor}`
      }}>
        <h3 style={{ color: textColor, marginBottom: '16px' }}>
          📋 Clearance - {container?.containerNumber}
        </h3>

        <div style={{ marginBottom: '16px', padding: '12px', background: getColor(isDarkMode, '#f1f5f9', '#0f172a'), borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', color: mutedColor }}>
            <div><strong>Equipment:</strong> {container?.equipment}</div>
            <div><strong>Position:</strong> {container?.position}</div>
            <div><strong>Aux Cargo:</strong> {cargoQty} {cargoType}</div>
            {container?.isDouble && <div><strong>2X:</strong> Yes</div>}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label style={{ color: mutedColor, fontSize: '0.6rem', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
            Truck Plate *
          </label>
          <input
            type="text"
            value={truckPlate}
            onChange={(e) => setTruckPlate(e.target.value.toUpperCase())}
            placeholder="e.g., GT-1234-24"
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              fontSize: '0.75rem',
              width: '100%',
              background: inputBg,
              color: inputText
            }}
            autoFocus
          />
        </div>

        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label style={{ color: mutedColor, fontSize: '0.6rem', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
            Remarks
          </label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Optional notes"
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              fontSize: '0.75rem',
              width: '100%',
              background: inputBg,
              color: inputText
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || !truckPlate}
            style={{
              flex: 1,
              padding: '8px 16px',
              background: (loading || !truckPlate) ? '#6c757d' : '#1e6f3f',
              color: 'white',
              border: 'none',
              borderRadius: '40px',
              fontWeight: '600',
              fontSize: '0.7rem',
              cursor: (loading || !truckPlate) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : '✅ Clear Container'}
          </button>
          <button
            className="btn btn-outline"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: getColor(isDarkMode, 'white', '#1e293b'),
              border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`,
              borderRadius: '40px',
              fontWeight: '600',
              fontSize: '0.7rem',
              cursor: 'pointer',
              color: getColor(isDarkMode, '#1e293b', '#e2e8f0')
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
