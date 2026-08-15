"use client"
import React, { useState, useEffect, useRef } from 'react'
import { getColor } from '@/lib/utils'

interface SearchSuggestionsProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  containers: any[]
  placeholder?: string
  isDarkMode: boolean
  onSearch: () => void
}

export default function SearchSuggestions({ 
  searchTerm, 
  setSearchTerm, 
  containers, 
  placeholder = "🔍 Search...", 
  isDarkMode,
  onSearch 
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    
    if (value.length > 0) {
      const matches = containers
        .filter(c => c.containerNumber.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 10)
        .map(c => c.containerNumber)
      setSuggestions(matches)
      setShowSuggestions(matches.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion)
    setShowSuggestions(false)
    onSearch()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false)
      onSearch()
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const bgColor = getColor(isDarkMode, 'white', '#1e293b')
  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const borderColor = getColor(isDarkMode, '#cbd5e1', '#475569')
  const hoverBg = getColor(isDarkMode, '#f1f5f9', '#2d3a5e')

  return (
    <div ref={wrapperRef} style={{ position: 'relative', flex: 1, minWidth: '120px' }}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => searchTerm.length > 0 && suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '6px 8px',
          borderRadius: '10px',
          border: `1px solid ${borderColor}`,
          fontSize: '0.75rem',
          background: bgColor,
          color: textColor,
          outline: 'none'
        }}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: bgColor,
          border: `1px solid ${borderColor}`,
          borderRadius: '8px',
          marginTop: '4px',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                color: textColor,
                borderBottom: index < suggestions.length - 1 ? `1px solid ${borderColor}` : 'none',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
