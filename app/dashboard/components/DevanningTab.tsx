"use client"
import React from 'react'
import { getColor } from '@/lib/utils'

interface DevanningTabProps {
  devanningQueue: any[]
  isDarkMode: boolean
  showToast: (msg: string) => void
  fetchAllData: () => void
  setShowWizard: (show: boolean) => void
  setWizardContainer: (container: any) => void
  setSelectedContainer: (container: any) => void
  setShowContainerDetailModal: (show: boolean) => void
}

export default function DevanningTab({
  devanningQueue,
  isDarkMode,
  showToast,
  fetchAllData,
  setShowWizard,
  setWizardContainer,
  setSelectedContainer,
  setShowContainerDetailModal
}: DevanningTabProps) {
  const unstuffContainer = async (id: string) => {
    try {
      const res = await fetch('/api/devanning/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'unstuff' }) })
      if (res.ok) { showToast('✅ Unstuffed'); fetchAllData() } else { showToast('❌ Failed') }
    } catch (err) { showToast('❌ Network error') }
  }

  const openWizard = (container: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setWizardContainer(container)
    setShowWizard(true)
  }

  const openDetail = (container: any) => {
    setSelectedContainer(container)
    setShowContainerDetailModal(true)
  }

  const statusColors: Record<string, string> = {
    'in_stack': '#94a3b8',
    'breaking': '#f59e0b',
    'positioned': '#3b82f6',
    'unlashing': '#8b5cf6',
    'ready_to_drop': '#10b981'
  }

  const statusLabels: Record<string, string> = {
    'in_stack': '📦 In Stack',
    'breaking': '🔨 Breaking',
    'positioned': '📍 Positioned',
    'unlashing': '🔗 Unlashing',
    'ready_to_drop': '📦 Ready to Drop'
  }

  const stepOrder = ['in_stack', 'breaking', 'positioned', 'unlashing', 'ready_to_drop']

  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#64748b', '#94a3b8')
  const cardBg = getColor(isDarkMode, 'white', '#111827')
  const borderColor = getColor(isDarkMode, '#eef2f6', '#1f2937')

  return (
    <div className="card" style={{background: cardBg, borderRadius:'16px', marginBottom:'14px', border: `1px solid ${borderColor}`}}>
      <div className="list-header" style={{background: getColor(isDarkMode, '#fefce8', '#0f172a'), borderRadius:'16px 16px 0 0', padding:'8px 14px', borderBottom: `2px solid ${getColor(isDarkMode, '#eab308', '#8b5cf6')}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'6px', color: getColor(isDarkMode, '#1e293b', '#f1f5f9')}}>
        <span>⏳ Devanning Queue</span>
      </div>
      <div className="card-body" style={{padding:'10px 14px'}}>
        <div>
          {devanningQueue.length === 0 ? (
            <div style={{padding:'16px',textAlign:'center',color:mutedColor,fontSize:'0.75rem'}}>⏳ No containers in devanning</div>
          ) : (
            devanningQueue.map((d: any) => {
              const currentStepIndex = stepOrder.indexOf(d.devanningStatus || 'in_stack')
              const completedSteps = stepOrder.slice(0, currentStepIndex + 1).length
              const progress = Math.round((completedSteps / stepOrder.length) * 100)
              const status = d.devanningStatus || 'in_stack'
              const statusColor = statusColors[status] || '#94a3b8'
              const statusLabel = statusLabels[status] || status

              const hasFlags = d.fuelNeeded || d.electricalFault || d.mechanicalFault
              const allResolved = d.fuel_resolved && d.electrical_resolved && d.mechanical_resolved

              return (
                <div 
                  key={d.id} 
                  className="container-item-list devanning-item" 
                  style={{
                    background: getColor(isDarkMode, '#f0f9ff', '#1a2332'), 
                    borderLeft: `4px solid ${statusColor}`, 
                    padding: '8px 10px', 
                    marginBottom: '4px', 
                    borderRadius: '8px',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => openDetail(d)}
                >
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'4px'}}>
                    <div style={{flex:1}}>
                      <strong style={{fontSize:'0.8rem',color: textColor}}>{d.containerNumber}</strong>
                      <span style={{fontSize:'0.6rem',color: mutedColor}}> | {d.position} | {d.equipment}</span>
                      <span className="devanning-type-badge" style={{background: getColor(isDarkMode, '#fef3c7', '#1e293b'), color: getColor(isDarkMode, '#b45309', '#fbbf24'), padding:'2px 10px', borderRadius:'20px', fontSize:'0.6rem', fontWeight:'600', border: getColor(isDarkMode, 'none', '1px solid #8b5cf6')}}>
                        {d.devanningType?.replace('_',' ').toUpperCase()}
                      </span>
                      <span style={{background:statusColor,color:'white',padding:'2px 8px',borderRadius:'12px',fontSize:'0.55rem',fontWeight:'600',display:'inline-block',marginLeft:'4px'}}>
                        {statusLabel}
                      </span>
                      {hasFlags && (
                        <span style={{background: allResolved ? '#10b981' : '#dc2626', color:'white', padding:'2px 8px', borderRadius:'12px', fontSize:'0.55rem', fontWeight:'600', display:'inline-block', marginLeft:'4px'}}>
                          {allResolved ? '✅ Resolved' : '⚠️ Active'}
                        </span>
                      )}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:'4px',marginLeft:'auto'}}>
                      <button className="btn-primary btn-sm" onClick={(e) => openWizard(d, e)} style={{background:'#1e6f3f',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer',width:'100%'}}>
                        🚀 Wizard
                      </button>
                      <button className="btn-success btn-sm" onClick={(e) => { e.stopPropagation(); unstuffContainer(d.id) }} style={{background:'#10b981',color:'white',border:'none',borderRadius:'40px',padding:'2px 8px',fontWeight:'600',fontSize:'0.6rem',cursor:'pointer',width:'100%'}}>
                        📦 Unstuff
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{marginTop:'4px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.55rem',color: mutedColor}}>
                      <span>Devanning Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div style={{width:'100%',height:'4px',background: getColor(isDarkMode, '#e2e8f0', '#334155'),borderRadius:'2px',overflow:'hidden',marginTop:'2px'}}>
                      <div style={{width:progress + '%',height:'100%',background: progress === 100 ? '#10b981' : '#f59e0b',transition:'width 0.3s ease'}} />
                    </div>
                  </div>
                  
                  {/* Flags display */}
                  {hasFlags && (
                    <div style={{fontSize:'0.55rem',color:'#f59e0b',marginTop:'2px'}}>
                      ⚠️ {d.fuelNeeded ? '⛽ Fuel needed ' : ''}
                      {d.electricalFault ? '⚡ Electrical fault ' : ''}
                      {d.mechanicalFault ? '🔧 Mechanical fault ' : ''}
                      {d.fuel_resolved && '✅ Fuel resolved '}
                      {d.electrical_resolved && '✅ Electrical resolved '}
                      {d.mechanical_resolved && '✅ Mechanical resolved '}
                    </div>
                  )}
                  {d.damageRemarks && (
                    <div style={{fontSize:'0.55rem',color:'#dc2626',marginTop:'2px'}}>💥 Damage: {d.damageRemarks}</div>
                  )}
                  
                  {/* Step indicators */}
                  <div style={{display:'flex',gap:'2px',marginTop:'4px',flexWrap:'wrap'}}>
                    {stepOrder.map((step, idx) => {
                      const isCompleted = step === 'in_stack' || d[`step_${step}`] === true
                      const isCurrent = d.devanningStatus === step
                      return (
                        <span 
                          key={step}
                          style={{
                            padding:'1px 6px',
                            borderRadius:'10px',
                            fontSize:'0.5rem',
                            background: isCompleted ? '#10b981' : (isCurrent ? '#f59e0b' : getColor(isDarkMode, '#e2e8f0', '#334155')),
                            color: isCompleted || isCurrent ? 'white' : getColor(isDarkMode, '#64748b', '#94a3b8')
                          }}
                        >
                          {isCompleted ? '✅' : (isCurrent ? '⏳' : '⬜')} {step === 'ready_to_drop' ? '📦' : step.charAt(0).toUpperCase() + step.slice(1)}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
