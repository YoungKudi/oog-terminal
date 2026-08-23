"use client"
import React, { useState, useEffect } from 'react'
import { getColor } from '@/lib/utils'

interface DevanningWizardProps {
  container: any
  onClose: () => void
  onComplete: () => void
  showToast: (msg: string) => void
}

export default function DevanningWizard({ container, onClose, onComplete, showToast }: DevanningWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [localContainer, setLocalContainer] = useState(container)
  const [flags, setFlags] = useState({
    fuelNeeded: false,
    electricalFault: false,
    mechanicalFault: false,
    fuelResolved: false,
    electricalResolved: false,
    mechanicalResolved: false,
    damageRemarks: ''
  })
  
  const steps = [
    { name: 'In Stack', key: 'in_stack', completed: true, icon: '📦', color: '#94a3b8' },
    { name: 'Breaking', key: 'breaking', completed: false, icon: '🔨', color: '#f59e0b' },
    { name: 'Positioned', key: 'positioned', completed: false, icon: '📍', color: '#3b82f6' },
    { name: 'Unlashing', key: 'unlashing', completed: false, icon: '🔗', color: '#8b5cf6' },
    { name: 'Ready to Drop', key: 'ready_to_drop', completed: false, icon: '📦', color: '#10b981' }
  ]

  const [localSteps, setLocalSteps] = useState(steps)

  useEffect(() => {
    const dark = localStorage.getItem('oog_dark_mode') === 'true'
    setIsDarkMode(dark)
  }, [])

  useEffect(() => {
    if (container) {
      setLocalContainer(container)
      const updatedSteps = steps.map(step => {
        if (step.key === 'in_stack') return { ...step, completed: true }
        if (step.key === 'breaking' && container.step_breaking) return { ...step, completed: true }
        if (step.key === 'positioned' && container.step_positioned) return { ...step, completed: true }
        if (step.key === 'unlashing' && container.step_unlashing) return { ...step, completed: true }
        if (step.key === 'ready_to_drop' && container.step_ready_to_drop) return { ...step, completed: true }
        return step
      })
      setLocalSteps(updatedSteps)
      
      const currentIndex = updatedSteps.findIndex(s => !s.completed)
      setCurrentStep(currentIndex === -1 ? updatedSteps.length - 1 : currentIndex)
      
      setFlags({
        fuelNeeded: container.fuelNeeded || false,
        electricalFault: container.electricalFault || false,
        mechanicalFault: container.mechanicalFault || false,
        fuelResolved: container.fuel_resolved || false,
        electricalResolved: container.electrical_resolved || false,
        mechanicalResolved: container.mechanical_resolved || false,
        damageRemarks: container.damageRemarks || ''
      })
    }
  }, [container])

  const completeStep = async () => {
    if (currentStep >= localSteps.length) return
    const step = localSteps[currentStep]
    if (step.completed) {
      setCurrentStep(currentStep + 1)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/devanning/' + container.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'completeStep',
          step: step.key,
          fuelNeeded: flags.fuelNeeded,
          electricalFault: flags.electricalFault,
          mechanicalFault: flags.mechanicalFault,
          damageRemarks: flags.damageRemarks
        })
      })
      if (res.ok) {
        const updatedSteps = [...localSteps]
        updatedSteps[currentStep] = { ...step, completed: true }
        setLocalSteps(updatedSteps)
        setCurrentStep(currentStep + 1)
        showToast('✅ ' + step.name + ' completed!')
        onComplete()
        const containerRes = await fetch('/api/devanning')
        if (containerRes.ok) {
          const containers = await containerRes.json()
          const updated = containers.find((c: any) => c.id === container.id)
          if (updated) setLocalContainer(updated)
        }
      } else {
        showToast('❌ Failed to complete step')
      }
    } catch (err) {
      showToast('❌ Network error')
    }
    setLoading(false)
  }

  const resolveFlag = async (flagType: string) => {
    if (!confirm(`Resolve ${flagType} flag?`)) return
    setLoading(true)
    try {
      const res = await fetch('/api/devanning/' + container.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolveFlag',
          resolveFlag: flagType
        })
      })
      if (res.ok) {
        showToast('✅ ' + flagType + ' flag resolved!')
        const updatedFlags = { ...flags }
        if (flagType === 'fuel') updatedFlags.fuelResolved = true
        if (flagType === 'electrical') updatedFlags.electricalResolved = true
        if (flagType === 'mechanical') updatedFlags.mechanicalResolved = true
        setFlags(updatedFlags)
        onComplete()
        const containerRes = await fetch('/api/devanning')
        if (containerRes.ok) {
          const containers = await containerRes.json()
          const updated = containers.find((c: any) => c.id === container.id)
          if (updated) setLocalContainer(updated)
        }
      } else {
        showToast('❌ Failed to resolve flag')
      }
    } catch (err) {
      showToast('❌ Network error')
    }
    setLoading(false)
  }

  const getProgress = () => {
    const completed = localSteps.filter(s => s.completed).length
    return Math.round((completed / localSteps.length) * 100)
  }

  const currentStepData = localSteps[currentStep] || localSteps[0]
  const bgColor = getColor(isDarkMode, 'white', '#1e293b')
  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#64748b', '#94a3b8')
  const borderColor = getColor(isDarkMode, '#e2e8f0', '#334155')
  const cardBg = getColor(isDarkMode, '#f8fafc', '#0f172a')

  return (
    <div style={{
      background: bgColor,
      color: textColor,
      borderRadius: '24px',
      padding: '24px',
      maxWidth: '520px',
      width: '92%',
      maxHeight: '85vh',
      overflowY: 'auto',
      border: `1px solid ${borderColor}`,
      margin: 'auto',
      position: 'relative'
    }}>
      <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span>🏗️ Devanning Wizard</span>
        <span style={{ fontSize: '0.7rem', color: mutedColor }}>
          {localContainer?.containerNumber}
        </span>
      </h3>

      {/* Progress Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: mutedColor }}>
          <span>Devanning Progress</span>
          <span>{getProgress()}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: getColor(isDarkMode, '#e2e8f0', '#334155'), borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
          <div style={{ width: getProgress() + '%', height: '100%', background: '#1e6f3f', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* Steps List */}
      <div style={{ marginBottom: '16px' }}>
        {localSteps.map((step, index) => {
          const progressValue = index === 0 ? 0 : Math.round((index / (localSteps.length - 1)) * 100)
          return (
            <div key={step.key} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              marginBottom: '4px',
              borderRadius: '10px',
              background: index === currentStep && !step.completed ? getColor(isDarkMode, '#f1f5f9', '#0f172a') : 'transparent',
              border: index === currentStep && !step.completed ? '2px solid ' + step.color : 'none',
              opacity: step.completed ? 0.7 : 1
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: step.completed ? '#10b981' : step.color,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                flexShrink: 0
              }}>
                {step.completed ? '✓' : step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: step.completed ? 'normal' : '600', color: textColor }}>
                  {step.name} {!step.completed && index === currentStep && <span style={{ fontSize: '0.55rem', color: '#f59e0b' }}>⬅️ Current</span>}
                  {step.completed && <span style={{ fontSize: '0.55rem', color: '#10b981', marginLeft: '4px' }}>✓</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Flags Section - Vertical Layout */}
      <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '12px', marginBottom: '12px' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: '600', color: mutedColor, marginBottom: '8px' }}>
          ⚠️ Flags
        </div>
        
        {/* Fuel Flag */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '6px 8px',
          marginBottom: '4px',
          borderRadius: '6px',
          background: flags.fuelNeeded ? getColor(isDarkMode, '#fef3c7', '#1e1b2e') : 'transparent'
        }}>
          <input 
            type="checkbox" 
            checked={flags.fuelNeeded} 
            onChange={(e) => setFlags({...flags, fuelNeeded: e.target.checked})}
            style={{ width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
          />
          <span style={{ fontSize: '0.7rem', flex: 1 }}>⛽ Fuel</span>
          {flags.fuelNeeded && (
            <span style={{ fontSize: '0.6rem', color: flags.fuelResolved ? '#10b981' : '#f59e0b' }}>
              {flags.fuelResolved ? '✅ Resolved' : '⚠️ Active'}
            </span>
          )}
          {flags.fuelNeeded && !flags.fuelResolved && (
            <button 
              onClick={() => resolveFlag('fuel')}
              style={{
                fontSize: '0.55rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '2px 10px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Resolve
            </button>
          )}
        </div>

        {/* Electrical Flag */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '6px 8px',
          marginBottom: '4px',
          borderRadius: '6px',
          background: flags.electricalFault ? getColor(isDarkMode, '#fef3c7', '#1e1b2e') : 'transparent'
        }}>
          <input 
            type="checkbox" 
            checked={flags.electricalFault} 
            onChange={(e) => setFlags({...flags, electricalFault: e.target.checked})}
            style={{ width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
          />
          <span style={{ fontSize: '0.7rem', flex: 1 }}>⚡ Electrical</span>
          {flags.electricalFault && (
            <span style={{ fontSize: '0.6rem', color: flags.electricalResolved ? '#10b981' : '#f59e0b' }}>
              {flags.electricalResolved ? '✅ Resolved' : '⚠️ Active'}
            </span>
          )}
          {flags.electricalFault && !flags.electricalResolved && (
            <button 
              onClick={() => resolveFlag('electrical')}
              style={{
                fontSize: '0.55rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '2px 10px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Resolve
            </button>
          )}
        </div>

        {/* Mechanical Flag */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '6px 8px',
          marginBottom: '4px',
          borderRadius: '6px',
          background: flags.mechanicalFault ? getColor(isDarkMode, '#fef3c7', '#1e1b2e') : 'transparent'
        }}>
          <input 
            type="checkbox" 
            checked={flags.mechanicalFault} 
            onChange={(e) => setFlags({...flags, mechanicalFault: e.target.checked})}
            style={{ width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
          />
          <span style={{ fontSize: '0.7rem', flex: 1 }}>🔧 Mechanical</span>
          {flags.mechanicalFault && (
            <span style={{ fontSize: '0.6rem', color: flags.mechanicalResolved ? '#10b981' : '#f59e0b' }}>
              {flags.mechanicalResolved ? '✅ Resolved' : '⚠️ Active'}
            </span>
          )}
          {flags.mechanicalFault && !flags.mechanicalResolved && (
            <button 
              onClick={() => resolveFlag('mechanical')}
              style={{
                fontSize: '0.55rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '2px 10px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Resolve
            </button>
          )}
        </div>

        {/* Damage Remarks */}
        <div style={{ marginTop: '8px' }}>
          <input 
            type="text" 
            placeholder="💥 Damage remarks" 
            value={flags.damageRemarks}
            onChange={(e) => setFlags({...flags, damageRemarks: e.target.value})}
            style={{ 
              padding: '6px 8px', 
              borderRadius: '8px', 
              border: `1px solid ${borderColor}`,
              fontSize: '0.65rem', 
              width: '100%', 
              background: getColor(isDarkMode, 'white', '#0a0e17'), 
              color: getColor(isDarkMode, '#1e293b', '#e2e8f0')
            }} 
          />
        </div>
      </div>

      {/* Current Step Actions */}
      {currentStep < localSteps.length && !localSteps[currentStep]?.completed && (
        <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '12px' }}>
          <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '0.8rem', color: textColor }}>
            Complete: {currentStepData?.name}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={completeStep}
              disabled={loading}
              style={{
                background: '#1e6f3f', 
                color: 'white', 
                border: 'none', 
                borderRadius: '40px', 
                padding: '8px 16px', 
                fontWeight: '600', 
                fontSize: '0.7rem', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                flex: 1,
                opacity: loading ? 0.6 : 1
              }}>
              {loading ? '⏳...' : '✅ Complete Step'}
            </button>
            <button 
              onClick={onClose}
              style={{
                background: getColor(isDarkMode, 'white', '#1e293b'),
                border: `1.5px solid ${borderColor}`,
                borderRadius: '40px',
                padding: '8px 16px',
                fontWeight: '600',
                fontSize: '0.7rem',
                cursor: 'pointer',
                color: getColor(isDarkMode, '#1e293b', '#e2e8f0')
              }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* All Complete */}
      {currentStep >= localSteps.length && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🎉</div>
          <div style={{ fontWeight: '600', fontSize: '0.9rem', color: textColor }}>
            All steps completed! {getProgress()}%
          </div>
          <div style={{ fontSize: '0.7rem', color: mutedColor }}>
            Container is ready for unstuffing
          </div>
          <button 
            onClick={onClose}
            style={{
              marginTop: '12px', 
              background: '#1e6f3f', 
              color: 'white', 
              border: 'none',
              borderRadius: '40px', 
              padding: '8px 16px', 
              fontWeight: '600', 
              fontSize: '0.7rem', 
              cursor: 'pointer'
            }}>
            Close Wizard
          </button>
        </div>
      )}
    </div>
  )
}
