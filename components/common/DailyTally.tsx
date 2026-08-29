import React from 'react'
import { parseCargoNumber } from '@/lib/utils'
import { getColor } from '@/lib/utils'

interface DailyTallyProps {
  locations: any[]
  containers: any[]
  isDarkMode: boolean
  greeting: string
  dateStr: string
}

export function DailyTally({ locations, containers, isDarkMode, greeting, dateStr }: DailyTallyProps) {
  return (
    <div className="tally-summary" style={{background: getColor(isDarkMode, '#f8fafc', '#1e293b'), borderRadius:'16px', padding:'12px 16px', marginBottom:'16px', border: getColor(isDarkMode, '1px solid #e2e8f0', '1px solid #334155')}}>
      <div className="greeting" style={{color: getColor(isDarkMode, '#1e293b', '#e2e8f0'), fontSize:'0.9rem', fontWeight:'600'}}>{greeting}</div>
      <div className="date-line" style={{color: getColor(isDarkMode, '#64748b', '#94a3b8'), fontSize:'0.75rem', marginBottom:'6px'}}>{dateStr}</div>
      <div style={{fontWeight:700,fontSize:'0.9rem',margin:'4px 0 2px',color: getColor(isDarkMode, '#1e293b', '#e2e8f0')}}>*OOG DAILY TALLIES*</div>
      <div>
        {locations.map(loc => {
          const locContainers = containers.filter(c => loc.positions?.includes(c.position))
          
          // Count equipment units (not containers)
          // Each container has equipment, and isDouble means 2 units
          const stuffedUnits = locContainers
            .filter(c => c.equipment !== 'Unstuffed' && c.equipment !== '')
            .reduce((sum, c) => sum + (c.isDouble ? 2 : 1), 0)
          
          const unstuffedUnits = locContainers
            .filter(c => c.equipment === 'Unstuffed' || c.equipment === '')
            .reduce((sum, c) => sum + (c.isDouble ? 2 : 1), 0)
          
          // Count equipment types (including 2X)
          const excavatorUnits = locContainers
            .filter(c => c.equipment === 'Excavator' || c.equipment === '2x Excavator')
            .reduce((sum, c) => sum + (c.isDouble ? 2 : 1), 0)
          
          const nonExcavatorUnits = locContainers
            .filter(c => c.equipment !== 'Excavator' && c.equipment !== '2x Excavator' && c.equipment !== 'Unstuffed' && c.equipment !== '')
            .reduce((sum, c) => sum + (c.isDouble ? 2 : 1), 0)
          
          // Count total equipment units (for display)
          const totalUnits = stuffedUnits + unstuffedUnits
          
          const boxes = locContainers.reduce((sum, c) => sum + parseCargoNumber(c.auxCargo), 0)
          
          return (
            <div key={loc.id} className="section">
              <div className="section-title" style={{color: getColor(isDarkMode, '#1e293b', '#e2e8f0')}}>📍 {loc.name}</div>
              <div className="row" style={{color: getColor(isDarkMode, '#64748b', '#94a3b8'),display:'flex',justifyContent:'space-between',padding:'1px 0',fontSize:'0.8rem'}}>
                <span>Stuffed Units</span>
                <span>{stuffedUnits}</span>
              </div>
              {loc.type === 'grid' && (
                <>
                  <div className="row" style={{color: getColor(isDarkMode, '#64748b', '#94a3b8'),display:'flex',justifyContent:'space-between',padding:'1px 0 1px 16px',fontSize:'0.75rem'}}>
                    <span>Excavators</span>
                    <span>{excavatorUnits}</span>
                  </div>
                  <div className="row" style={{color: getColor(isDarkMode, '#64748b', '#94a3b8'),display:'flex',justifyContent:'space-between',padding:'1px 0 1px 16px',fontSize:'0.75rem'}}>
                    <span>Non-excavators</span>
                    <span>{nonExcavatorUnits}</span>
                  </div>
                </>
              )}
              <div className="row" style={{color: getColor(isDarkMode, '#64748b', '#94a3b8'),display:'flex',justifyContent:'space-between',padding:'1px 0',fontSize:'0.8rem'}}>
                <span>Unstuffed Units</span>
                <span>{unstuffedUnits}</span>
              </div>
              {loc.type === 'row' && (
                <div className="row" style={{color: getColor(isDarkMode, '#64748b', '#94a3b8'),display:'flex',justifyContent:'space-between',padding:'1px 0 1px 16px',fontSize:'0.75rem'}}>
                  <span>Boxes</span>
                  <span>{boxes}</span>
                </div>
              )}
              <div className="row" style={{color: getColor(isDarkMode, '#64748b', '#94a3b8'),display:'flex',justifyContent:'space-between',padding:'1px 0 1px 16px',fontSize:'0.65rem',borderTop:`1px solid ${getColor(isDarkMode, '#e2e8f0', '#334155')}`,marginTop:'2px',paddingTop:'2px'}}>
                <span>Total Units</span>
                <span style={{fontWeight:'600'}}>{totalUnits}</span>
              </div>
            </div>
          )
        })}
        <div className="total-row" style={{borderTop:`1px solid ${getColor(isDarkMode, '#e2e8f0', '#334155')}`,marginTop:'6px',paddingTop:'6px',fontWeight:'700',fontSize:'0.9rem',display:'flex',justifyContent:'space-between',color: getColor(isDarkMode, '#1e293b', '#e2e8f0')}}>
          <span>STACK (Total Stuffed Units)</span>
          <span>
            {containers
              .filter(c => c.equipment !== 'Unstuffed' && c.equipment !== '')
              .reduce((sum, c) => sum + (c.isDouble ? 2 : 1), 0)}
          </span>
        </div>
      </div>
    </div>
  )
}
