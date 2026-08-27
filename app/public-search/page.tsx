"use client"
import React, { useState } from 'react'

export default function PublicSearchPage() {
  const [searchInput, setSearchInput] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Parse container numbers - split by comma or newline
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

  // Helper to get status color
  const getStatusColor = (found: boolean) => {
    return found ? '#10b981' : '#ef4444'
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f0f2f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '700px', 
        width: '100%',
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔍</div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#1e293b',
            margin: '0 0 4px 0'
          }}>
            Container Search
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
            Search for containers in the yard stack
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500', 
              fontSize: '0.8rem', 
              color: '#4b5563' 
            }}>
              Container Numbers
            </label>
            <textarea
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter one or more container numbers separated by commas&#10;e.g., MAEU1234567, TC246789, SUDU8901234"
              rows={3}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '2px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontFamily: 'monospace',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1e6f3f'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={loading || !searchInput.trim()}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: loading || !searchInput.trim() ? '#6c757d' : '#1e6f3f',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading || !searchInput.trim() ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {loading ? 'Searching...' : '🔍 Search Containers'}
            </button>
            
            {searchInput && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  padding: '12px 20px',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </form>

        {error && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: '#fee2e2',
            color: '#dc2626',
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Results */}
        {searched && !loading && (
          <div style={{ marginTop: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '10px',
              borderBottom: '2px solid #e2e8f0'
            }}>
              <h3 style={{ 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                color: '#1e293b',
                margin: 0
              }}>
                📋 Results
              </h3>
              <span style={{ 
                fontSize: '0.75rem', 
                color: '#64748b'
              }}>
                {results.length} container(s) found
              </span>
            </div>

            <div style={{ marginTop: '12px' }}>
              {results.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '30px 20px',
                  color: '#64748b'
                }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>📭</div>
                  <p style={{ margin: 0 }}>No containers found</p>
                  <p style={{ fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                    Check the container numbers and try again
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {results.map((result, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: result.found ? '#f0fdf4' : '#fef2f2',
                        borderRadius: '8px',
                        border: `1px solid ${result.found ? '#86efac' : '#fca5a5'}`
                      }}
                    >
                      <div>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          color: '#1e293b'
                        }}>
                          {result.containerNumber}
                        </span>
                        {result.found && result.container && (
                          <div style={{ 
                            fontSize: '0.7rem', 
                            color: '#64748b',
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
                          background: result.found ? '#10b981' : '#ef4444'
                        }} />
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          color: result.found ? '#10b981' : '#ef4444'
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

        {/* Footer */}
        <div style={{
          marginTop: '30px',
          paddingTop: '16px',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
          fontSize: '0.65rem',
          color: '#94a3b8'
        }}>
          Developed by <strong>O'Bour Dev</strong> © 2026
        </div>
      </div>
    </div>
  )
}
