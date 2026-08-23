"use client"
import React, { useState } from 'react'
import { getColor } from '@/lib/utils'

interface SearchModalProps {
  onClose: () => void
  isDarkMode: boolean
  containers: any[]
  unstuffedContainers: any[]
  showToast: (msg: string) => void
}

export default function SearchModal({ onClose, isDarkMode, containers, unstuffedContainers, showToast }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTab, setSearchTab] = useState('tallies')

  const handleSearch = () => {
    const term = searchTerm.trim().toUpperCase()
    if (!term) {
      showToast('❌ Enter a container number')
      return
    }
    
    // Switch to the selected tab
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'))
    document.getElementById(searchTab + '-tab')?.classList.add('active')
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'))
    document.querySelector(`.tab-button[data-tab="${searchTab}"]`)?.classList.add('active')
    
    // Trigger search in the selected tab
    if (searchTab === 'tallies') {
      const items = document.querySelectorAll('#dailyTalliesContainer .tally-row')
      let found = false
      items.forEach(item => {
        const text = item.textContent?.toUpperCase() || ''
        if (text.includes(term)) {
          (item as HTMLElement).style.display = 'flex'
          ;(item as HTMLElement).style.border = '2px solid #f59e0b'
          found = true
        } else {
          (item as HTMLElement).style.display = 'none'
        }
      })
      if (!found) showToast('❌ No containers found')
      else showToast('✅ Found matching containers')
    } else if (searchTab === 'receivals') {
      const items = document.querySelectorAll('#receivalsDailyContainer .container-item-list')
      let found = false
      items.forEach(item => {
        const text = item.textContent?.toUpperCase() || ''
        if (text.includes(term)) {
          (item as HTMLElement).style.display = 'block'
          ;(item as HTMLElement).style.border = '2px solid #f59e0b'
          found = true
        } else {
          (item as HTMLElement).style.display = 'none'
        }
      })
      if (!found) showToast('❌ No containers found')
      else showToast('✅ Found matching containers')
    } else if (searchTab === 'unstuffed') {
      const items = document.querySelectorAll('#unstuffedList .container-item-list')
      let found = false
      items.forEach(item => {
        const text = item.textContent?.toUpperCase() || ''
        if (text.includes(term)) {
          (item as HTMLElement).style.display = 'block'
          ;(item as HTMLElement).style.border = '2px solid #f59e0b'
          found = true
        } else {
          (item as HTMLElement).style.display = 'none'
        }
      })
      if (!found) showToast('❌ No containers found')
      else showToast('✅ Found matching containers')
    }
    onClose()
  }

  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#4b5563', '#94a3b8')
  const bgColor = getColor(isDarkMode, 'white', '#1e293b')
  const borderColor = getColor(isDarkMode, '#eef2f6', '#334155')
  const inputBg = getColor(isDarkMode, 'white', '#0a0e17')
  const inputText = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const btnText = getColor(isDarkMode, '#1e293b', '#e2e8f0')

  return (
    <div className="modal" style={{display:'flex', position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', justifyContent:'center', alignItems:'center', zIndex:1000}}>
      <div className="modal-content" style={{background: bgColor, color: textColor, borderRadius:'24px', padding:'18px', maxWidth:'440px', width:'92%', maxHeight:'80vh', overflowY:'auto', border: `1px solid ${borderColor}`}}>
        <h3 style={{color: textColor, marginBottom:'10px'}}>🔍 Quick Search</h3>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Search in:</label>
          <select value={searchTab} onChange={(e) => setSearchTab(e.target.value)} style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}}>
            <option value="tallies">📊 Daily Tallies</option>
            <option value="receivals">📦 Receivals</option>
            <option value="unstuffed">✅ Unstuffed</option>
          </select>
        </div>
        <div className="form-group" style={{marginBottom:'8px'}}>
          <label style={{color: mutedColor, fontSize:'0.6rem', fontWeight:'600', textTransform:'uppercase', display:'block', marginBottom:'2px'}}>Container Number</label>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Enter container number..." autoFocus style={{padding:'6px 8px',borderRadius:'10px',border:'1px solid #cfdfed',fontSize:'0.75rem',width:'100%',background: inputBg, color: inputText}} />
        </div>
        <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
          <button className="btn btn-primary" onClick={handleSearch} style={{background:'#1e6f3f',color:'white',border:'none',borderRadius:'40px',padding:'5px 12px',fontWeight:'600',fontSize:'0.7rem',cursor:'pointer', flex:1}}>🔍 Search</button>
          <button className="btn btn-outline" onClick={onClose} style={{
            background: getColor(isDarkMode, 'white', '#1e293b'),
            border: `1.5px solid ${getColor(isDarkMode, '#cbd5e1', '#475569')}`,
            borderRadius: '40px',
            padding: '5px 12px',
            fontWeight: '600',
            fontSize: '0.7rem',
            cursor: 'pointer',
            color: getColor(isDarkMode, '#1e293b', '#e2e8f0')
          }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
