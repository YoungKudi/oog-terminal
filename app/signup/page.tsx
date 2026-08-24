"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [workerId, setWorkerId] = useState('')
  const [role, setRole] = useState<'staff' | 'casual' | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Validate worker ID based on role
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

  const getFormatHint = (roleType: 'staff' | 'casual' | null): string => {
    if (!roleType) return 'Select a worker type'
    if (roleType === 'staff') return '7 digits (e.g., 4567423)'
    return '2 letters + 6 digits (e.g., TC246789)'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!email || !workerId || !password || !confirmPassword || !phone || !role) {
      setError('Please fill in all fields')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    const cleanWorkerId = workerId.toUpperCase().trim()
    let isValid = false
    let errorMsg = ''
    
    if (role === 'staff') {
      isValid = /^\d{7}$/.test(cleanWorkerId)
      if (!isValid) errorMsg = 'Staff ID must be exactly 7 digits'
    } else if (role === 'casual') {
      isValid = /^[A-Z]{2}\d{6}$/.test(cleanWorkerId)
      if (!isValid) errorMsg = 'Casual ID must be 2 letters + 6 digits'
    }
    
    if (!isValid) {
      setError(errorMsg)
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          workerId: cleanWorkerId, 
          password, 
          phone, 
          name
        })
      })
      const data = await response.json()
      if (response.ok) {
        setSuccess('✅ Account created successfully! Redirecting to login...')
        setTimeout(() => router.push('/login'), 2000)
      } else {
        setError(data.error || 'Signup failed. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please check your connection.')
    }
    setLoading(false)
  }

  const textColor = '#1e293b'
  const mutedColor = '#64748b'
  const borderColor = '#d1d5db'
  const primaryColor = '#1e6f3f'
  const isValid = isValidWorkerId(workerId, role)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '40px' }}>📝</span>
          <h1 style={{ marginTop: '8px', fontSize: '24px', fontWeight: '700', color: textColor }}>Create Account</h1>
          <p style={{ color: mutedColor, fontSize: '0.85rem' }}>Register with your Worker ID</p>
        </div>
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', whiteSpace: 'pre-line' }}>❌ {error}</div>}
        {success && <div style={{ background: '#d1fae5', color: '#059669', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>✅ {success}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '0.75rem', color: '#4b5563' }}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '0.9rem' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '0.75rem', color: '#4b5563' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '0.9rem' }} required />
          </div>
          
          {/* Role Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.75rem', color: '#4b5563' }}>
              Worker Type <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRole('staff')}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: `2px solid ${role === 'staff' ? '#1e6f3f' : '#d1d5db'}`,
                  background: role === 'staff' ? '#f0fdf4' : 'white',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  fontWeight: role === 'staff' ? '600' : '400'
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>👔</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>Staff</div>
                <div style={{ fontSize: '0.6rem', color: '#64748b' }}>7 digits</div>
                <div style={{ fontSize: '0.5rem', color: '#64748b', marginTop: '2px' }}>e.g., 4567423</div>
              </button>
              
              <button
                type="button"
                onClick={() => setRole('casual')}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: `2px solid ${role === 'casual' ? '#1e6f3f' : '#d1d5db'}`,
                  background: role === 'casual' ? '#f0fdf4' : 'white',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  fontWeight: role === 'casual' ? '600' : '400'
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>🧑‍💼</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>Casual</div>
                <div style={{ fontSize: '0.6rem', color: '#64748b' }}>2 letters + 6 digits</div>
                <div style={{ fontSize: '0.5rem', color: '#64748b', marginTop: '2px' }}>e.g., TC246789</div>
              </button>
            </div>
          </div>
          
          {/* Worker ID Input - Single Field */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '0.75rem', color: '#4b5563' }}>
              Worker ID <span style={{ color: '#dc2626' }}>*</span>
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
              placeholder={role ? getFormatHint(role) : 'Select worker type first'}
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
            <div style={{ 
              fontSize: '0.5rem', 
              color: '#64748b', 
              marginTop: '4px'
            }}>
              {role === 'staff' ? 'Format: 1234567' : 'Format: AB123456'}
            </div>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '0.75rem', color: '#4b5563' }}>Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0209679230"
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '0.9rem' }} required />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '0.75rem', color: '#4b5563' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters"
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '0.9rem' }} required />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '0.75rem', color: '#4b5563' }}>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password"
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '0.9rem' }} required />
          </div>
          <button type="submit" disabled={loading || !role || !isValid} style={{ 
            width: '100%', 
            padding: '12px', 
            background: (loading || !role || !isValid) ? '#6c757d' : primaryColor, 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '1rem', 
            fontWeight: '600', 
            cursor: (loading || !role || !isValid) ? 'not-allowed' : 'pointer' 
          }}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>
          <Link href="/login" style={{ color: primaryColor, textDecoration: 'underline' }}>Already have an account? Login</Link>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.65rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
          Developed by <strong>O'Bour Dev</strong> © 2026
        </div>
      </div>
    </div>
  )
}
