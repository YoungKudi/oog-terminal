"use client"
import React, { useState, useEffect } from 'react'
import { getColor } from '@/lib/utils'
import { AUX_CARGO_TYPES } from '@/lib/constants'

interface ClearanceModalProps {
  isOpen: boolean
  onClose: () => void
  container: any
  onClear: (data: any) => void
  isDarkMode: boolean
  showToast: (msg: string) => void
}

export default function ClearanceModal({
  isOpen,
  onClose,
  container,
  onClear,
  isDarkMode,
  showToast
}: ClearanceModalProps) {
  const [truckPlate, setTruckPlate] = useState('')
  const [remarks, setRemarks] = useState('')
  const [loading, setLoading] = useState(false)
  const [cargoQty, setCargoQty] = useState(0)
  const [cargoType, setCargoType] = useState('units')

  // Auto-populate cargo from container
  useEffect(() => {
    if (container) {
      const auxCargo = container.auxCargo || ''
      const cargoMatch = auxCargo.match(/(\d+)\s*(\w+)/)
      if (cargoMatch) {
        setCargoQty(parseInt(cargoMatch[1]) || 0)
        setCargoType(cargoMatch[2] || 'units')
      } else {
        setCargoQty(0)
        setCargoType('units')
      }
    }
  }, [container])

  const handleSubmit = () => {
    if (!truckPlate) {
      showToast('❌ Please enter truck plate number')
      return
    }

    setLoading(true)
    
    const clearanceData = {
      containerNumber: container?.containerNumber,
      size: container?.size,
      type: container?.type,
      equipment: container?.equipment,
      vessel: container?.vessel || '',
      arrivalDate: container?.arrivalDate || '',
      unstuffedDate: container?.unstuffedAt || new Date().toISOString().slice(0, 10),
      deliveryDate: new Date().toISOString().slice(0, 10),
      location: container?.position,
      content: container?.equipment,
      truckPlate: truckPlate.toUpperCase(),
      agentContact: container?.agency || '',
      boxesLoaded: cargoQty,
      auxCargoType: cargoType,
      devanningType: container?.devanningType || 'unstuffing',
      remarks: remarks || '',
      isDouble: container?.isDouble || false
    }

    onClear(clearanceData)
    setLoading(false)
    onClose()
  }

  if (!isOpen) return null

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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="modal-content" style={{
        background: bgColor,
        color: textColor,
        borderRadius: '24px',
        padding: '24px',
        maxWidth: '480px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: `1px solid ${borderColor}`
      }}>
        <h3 style={{ color: textColor, marginBottom: '8px' }}>
          📋 Clearance - {container?.containerNumber}
        </h3>
        <p style={{ fontSize: '0.7rem', color: mutedColor, marginBottom: '16px' }}>
          Equipment: {container?.equipment} | Position: {container?.position}
          {container?.isDouble && ' | 2X'}
        </p>

        {/* Truck Plate */}
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label style={{
            color: mutedColor,
            fontSize: '0.6rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '4px'
          }}>
            Truck Plate <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="text"
            value={truckPlate}
            onChange={(e) => setTruckPlate(e.target.value.toUpperCase())}
            placeholder="e.g., GT-1234-24"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              fontSize: '0.85rem',
              background: inputBg,
              color: inputText
            }}
          />
        </div>

        {/* Cargo Quantity and Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div className="form-group">
            <label style={{
              color: mutedColor,
              fontSize: '0.6rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '4px'
            }}>
              Cargo Quantity
            </label>
            <input
              type="number"
              value={cargoQty}
              onChange={(e) => setCargoQty(parseInt(e.target.value) || 0)}
              min="0"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${borderColor}`,
                fontSize: '0.85rem',
                background: inputBg,
                color: inputText
              }}
            />
          </div>
          <div className="form-group">
            <label style={{
              color: mutedColor,
              fontSize: '0.6rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '4px'
            }}>
              Cargo Type
            </label>
            <select
              value={cargoType}
              onChange={(e) => setCargoType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${borderColor}`,
                fontSize: '0.85rem',
                background: inputBg,
                color: inputText
              }}
            >
              {AUX_CARGO_TYPES.map(t => (
                <option key={t} value={t.toLowerCase()}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Remarks */}
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label style={{
            color: mutedColor,
            fontSize: '0.6rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '4px'
          }}>
            Remarks
          </label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Optional notes"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              fontSize: '0.85rem',
              background: inputBg,
              color: inputText
            }}
          />
        </div>

        {/* Summary */}
        <div style={{
          padding: '10px 12px',
          background: getColor(isDarkMode, '#f1f5f9', '#0f172a'),
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '0.7rem',
          color: mutedColor
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Container:</span>
            <span style={{ fontWeight: '600', color: textColor }}>{container?.containerNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Equipment:</span>
            <span style={{ fontWeight: '600', color: textColor }}>{container?.equipment}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Cargo:</span>
            <span style={{ fontWeight: '600', color: textColor }}>{cargoQty} {cargoType}</span>
          </div>
          {container?.isDouble && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>2X:</span>
              <span style={{ fontWeight: '600', color: '#f59e0b' }}>Yes</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleSubmit}
            disabled={loading || !truckPlate}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: (loading || !truckPlate) ? '#6c757d' : '#1e6f3f',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: (loading || !truckPlate) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : '✅ Clear Container'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              background: getColor(isDarkMode, 'white', '#1e293b'),
              border: `1.5px solid ${borderColor}`,
              borderRadius: '8px',
              color: textColor,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
