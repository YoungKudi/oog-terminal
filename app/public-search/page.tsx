"use client"
import React, { useState } from 'react'
import Link from 'next/link'

export default function PublicSearchPage() {
  const [searchInput, setSearchInput] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const containerNumbers = searchInput
      .split(/[, \n]+/)
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0)
    
    if (containerNumbers.length === 0) {
      setError('Please enter at least one container number')
      return
    }
    
    setLoading(true)
    setError('')
    setSearched(true)
    
    try {
      const response = await fetch('/api/public-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ containerNumbers })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResults(data.results || [])
      } else {
        setError(data.error || 'Search failed')
        setResults([])
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setResults([])
    }
    
    setLoading(false)
  }

  const handleClear = () => {
    setSearchInput('')
    setResults([])
    setError('')
    setSearched(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Top Bar - Sign In / Sign Up */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '12px 0',
        gap: '16px'
      }}>
        <Link 
          href="/login" 
          style={{
            color: '#1a0dab',
            fontSize: '0.85rem',
            textDecoration: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f1f3f4'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          Sign In
        </Link>
        <Link 
          href="/signup" 
          style={{
            background: '#1a73e8',
            color: 'white',
            fontSize: '0.85rem',
            textDecoration: 'none',
            padding: '8px 20px',
            borderRadius: '4px',
            fontWeight: '500',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#1557b0'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#1a73e8'}
        >
          Sign Up
        </Link>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
        maxWidth: '700px',
        marginTop: results.length === 0 && !searched ? '5vh' : '20px'
      }}>
        {/* Logo / Title */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '56px', marginBottom: '4px' }}>🚢</div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '300',
            color: '#202124',
            margin: 0,
            letterSpacing: '-0.5px'
          }}>
            Search <span style={{ fontWeight: '700' }}>OOG</span> Stack
          </h1>
          <p style={{
            color: '#5f6368',
            fontSize: '0.85rem',
            margin: '4px 0 0 0'
          }}>
            Enter container numbers to check their location in the yard
          </p>
        </div>

        {/* Search Form - Google Style */}
        <form onSubmit={handleSearch} style={{ width: '100%' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #dfe1e5',
            borderRadius: '24px',
            padding: '8px 16px',
            background: 'white',
            boxShadow: '0 1px 6px rgba(32,33,36,0.08)',
            transition: 'box-shadow 0.2s, border-color 0.2s'
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 12px rgba(32,33,36,0.15)'
            e.currentTarget.style.borderColor = 'rgba(223,225,229,0)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 6px rgba(32,33,36,0.08)'
            e.currentTarget.style.borderColor = '#dfe1e5'
          }}
          >
            <span style={{ fontSize: '18px', color: '#9aa0a6', marginRight: '12px' }}>🔍</span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter container numbers (e.g., MAEU1234567, TC246789)"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                padding: '12px 0',
                background: 'transparent',
                color: '#202124',
                fontFamily: 'Arial, sans-serif'
              }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9aa0a6',
                  fontSize: '16px',
                  padding: '4px 8px'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '20px'
          }}>
            <button
              type="submit"
              disabled={loading || !searchInput.trim()}
              style={{
                padding: '10px 24px',
                background: loading || !searchInput.trim() ? '#f1f3f4' : '#f8f9fa',
                color: loading || !searchInput.trim() ? '#9aa0a6' : '#3c4043',
                border: '1px solid #f8f9fa',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: loading || !searchInput.trim() ? 'default' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading && searchInput.trim()) {
                  e.currentTarget.style.borderColor = '#dadce0'
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.08)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#f8f9fa'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {loading ? 'Searching...' : '🔍 Search Containers'}
            </button>
            {searchInput && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  padding: '10px 24px',
                  background: '#f8f9fa',
                  color: '#3c4043',
                  border: '1px solid #f8f9fa',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#dadce0'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#f8f9fa'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div style={{
            marginTop: '16px',
            padding: '10px 16px',
            background: '#fce8e6',
            color: '#d93025',
            borderRadius: '4px',
            fontSize: '0.85rem',
            width: '100%',
            textAlign: 'center'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Results - Google-style */}
        {searched && !loading && (
          <div style={{
            marginTop: '24px',
            width: '100%',
            borderTop: '1px solid #dadce0',
            paddingTop: '16px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '10px',
              borderBottom: '1px solid #e8eaed'
            }}>
              <span style={{
                fontSize: '0.85rem',
                color: '#5f6368'
              }}>
                {results.length} container(s) found
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: '#9aa0a6'
              }}>
                {results.filter(r => r.found).length} in stack
              </span>
            </div>

            <div style={{ marginTop: '12px' }}>
              {results.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#5f6368'
                }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>📭</div>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>No containers found</p>
                  <p style={{ fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                    Check the container numbers and try again
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {results.map((result, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: result.found ? '#f1f8e9' : '#fce8e6',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${result.found ? '#34a853' : '#d93025'}`
                      }}
                    >
                      <div>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          color: '#202124'
                        }}>
                          {result.containerNumber}
                        </span>
                        {result.found && result.container && (
                          <div style={{ 
                            fontSize: '0.7rem', 
                            color: '#5f6368',
                            marginTop: '2px'
                          }}>
                            📍 {result.container.position} | {result.container.equipment}
                            {result.container.size && ` | ${result.container.size}ft`}
                          </div>
                        )}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: result.found ? '#34a853' : '#d93025'
                        }} />
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '500',
                          color: result.found ? '#1e7e34' : '#d93025'
                        }}>
                          {result.found ? 'In Stack' : 'Not Found'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 'auto',
        padding: '16px 0',
        textAlign: 'center',
        fontSize: '0.65rem',
        color: '#9aa0a6',
        borderTop: '1px solid #e8eaed',
        width: '100%',
        maxWidth: '1200px'
      }}>
        Developed by <strong>O'Bour Dev</strong> © 2026
      </div>
    </div>
  )
}
