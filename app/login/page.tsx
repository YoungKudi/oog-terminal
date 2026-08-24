"use client"
import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [workerId, setWorkerId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<'staff' | 'casual' | null>(null)
  const router = useRouter()

  const isValidWorkerId = (id: string, roleType: 'staff' | 'casual' | null): boolean => {
    if (!roleType || !id) return false
    const clean = id.toUpperCase().trim()
    if (roleType === 'staff') {
      return /^\d{7}$/.test(clean)
    } else if (roleType === 'casual') {
      return /^[A-Z]{2}\d{6}$/.test(clean)
    }
    return false
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formattedWorkerId = workerId.toUpperCase().trim()
    
    const res = await signIn('credentials', { 
      workerId: formattedWorkerId, 
      password, 
      redirect: false 
    })
    setLoading(false)
    if (res?.error) { 
      setError('Invalid Worker ID or password') 
    } else { 
      router.push('/dashboard')
      router.refresh()
    }
  }

  const isValid = isValidWorkerId(workerId, role)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '40px' }}>🚢</span>
          <h1 style={{ marginTop: '8px', fontSize: '24px', fontWeight: '700' }}>OOG Terminal</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Sign in with your Worker ID</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.75rem', color: '#4b5563' }}>Worker Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setRole('staff')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `2px solid ${role === 'staff' ? '#1e6f3f' : '#d1d5db'}`,
                  background: role === 'staff' ? '#f0fdf4' : 'white',
                  cursor: 'pointer',
                  fontWeight: role === 'staff' ? '600' : '400',
                  fontSize: '0.7rem',
                  transition: 'all 0.2s'
                }}
              >
                👔 Staff
              </button>
              <button
                type="button"
                onClick={() => setRole('casual')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `2px solid ${role === 'casual' ? '#1e6f3f' : '#d1d5db'}`,
                  background: role === 'casual' ? '#f0fdf4' : 'white',
                  cursor: 'pointer',
                  fontWeight: role === 'casual' ? '600' : '400',
                  fontSize: '0.7rem',
                  transition: 'all 0.2s'
                }}
              >
                🧑‍💼 Casual
              </button>
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '0.75rem', color: '#4b5563' }}>
              Worker ID
              {role && (
                <span style={{ fontSize: '0.55rem', color: '#64748b', marginLeft: '8px', fontWeight: '400' }}>
                  ({role === 'staff' ? '7 digits' : '2 letters + 6 digits'})
                </span>
              )}
            </label>
            <input 
              type="text" 
              value={workerId} 
              onChange={(e) => {
                let value = e.target.value.toUpperCase()
                value = value.replace(/[^A-Z0-9]/g, '')
                setWorkerId(value)
              }}
              placeholder={role ? (role === 'staff' ? 'Enter 7 digits' : 'Enter 2 letters + 6 digits') : 'Select worker type first'}
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                border: `2px solid ${workerId && role ? (isValid ? '#10b981' : '#dc2626') : '#d1d5db'}`,
                borderRadius: '8px', 
                fontSize: '0.9rem', 
                outline: 'none',
                background: role ? 'white' : '#f1f5f9',
                opacity: role ? 1 : 0.6,
                cursor: role ? 'text' : 'not-allowed'
              }} 
              required 
              disabled={!role}
            />
            {workerId && role && (
              <div style={{ 
                fontSize: '0.65rem', 
                color: isValid ? '#10b981' : '#dc2626',
                marginTop: '4px'
              }}>
                {isValid ? (
                  role === 'staff' ? '✅ Valid Staff ID' : '✅ Valid Casual ID'
                ) : (
                  role === 'staff' ? '❌ Staff ID must be exactly 7 digits' : '❌ Casual ID must be 2 letters + 6 digits'
                )}
              </div>
            )}
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '0.75rem', color: '#4b5563' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} 
              required 
            />
          </div>
          {error && <p style={{ color: '#dc2626', marginBottom: '12px', fontSize: '0.85rem' }}>{error}</p>}
          <button 
            type="submit" 
            disabled={loading || !role || !isValid} 
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: (loading || !role || !isValid) ? '#6c757d' : '#1e6f3f', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '1rem', 
              fontWeight: '600', 
              cursor: (loading || !role || !isValid) ? 'not-allowed' : 'pointer' 
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>
          <Link href="/signup" style={{ color: '#1e6f3f', textDecoration: 'underline' }}>Don't have an account? Sign up</Link>
        </div>
        <div style={{ marginTop: "8px", textAlign: "center", fontSize: "0.8rem" }}>
          <Link href="/auth/reset-password" style={{ color: "#64748b", textDecoration: "underline" }}>Forgot Password?</Link>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.65rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
          Developed by <strong>O'Bour Dev</strong> © 2026
        </div>
      </div>
    </div>
  )
}
