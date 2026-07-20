'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [workerId, setWorkerId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!email || !workerId || !password || !confirmPassword || !phone) {
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
    
    // Worker ID: 7 digits OR 2 letters + 6 digits
    const workerIdRegex1 = /^\d{7}$/           // 7 digits (staff)
    const workerIdRegex2 = /^[A-Z]{2}\d{6}$/   // 2 letters + 6 digits (casual)
    const cleanWorkerId = workerId.toUpperCase().trim()
    
    if (!workerIdRegex1.test(cleanWorkerId) && !workerIdRegex2.test(cleanWorkerId)) {
      setError('Worker ID must be either:\n• 7 digits (e.g., 7890411) for staff\n• 2 letters + 6 digits (e.g., SP670311) for casual workers')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, workerId: cleanWorkerId, password, phone, name })
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
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '0.75rem', color: '#4b5563' }}>Worker ID</label>
            <input type="text" value={workerId} onChange={(e) => setWorkerId(e.target.value.toUpperCase().trim())} 
              placeholder="7 digits (staff) OR 2 letters+6 digits (casual)" 
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '0.9rem' }} required />
            <div style={{ fontSize: '0.6rem', color: mutedColor, marginTop: '4px' }}>
              Staff: 7 digits (e.g., 7890411) | Casual: 2 letters + 6 digits (e.g., SP670311)
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
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: loading ? '#6c757d' : primaryColor, color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
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
