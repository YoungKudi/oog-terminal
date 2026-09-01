"use client"
import React, { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [workerId, setWorkerId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingApproval, setPendingApproval] = useState(false)
  const [accountDenied, setAccountDenied] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setPendingApproval(true)
      setShowResend(true)
    }
    
    // Check if user came from signup with pending approval
    const pending = localStorage.getItem('pendingApproval')
    if (pending === 'true') {
      setPendingApproval(true)
      setShowResend(true)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPendingApproval(false)
    setAccountDenied(false)
    
    const result = await signIn('credentials', {
      workerId: workerId.toUpperCase().trim(),
      password,
      redirect: false,
    })
    
    setLoading(false)
    
    if (result?.error) {
      if (result.error === 'Pending approval') {
        setPendingApproval(true)
        setShowResend(true)
        setError('')
      } else if (result.error === 'Account denied') {
        setAccountDenied(true)
      } else {
        setError('Invalid Worker ID or password')
      }
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleResendNotification = async () => {
    try {
      const res = await fetch('/api/auth/resend-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId })
      })
      if (res.ok) {
        setError('')
        setShowResend(false)
        // Show a success message
        alert('Approval notification resent. Please check your email.')
      }
    } catch (err) {
      console.error('Error resending approval:', err)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '40px' }}>🚢</span>
          <h1 style={{ marginTop: '8px', fontSize: '24px', fontWeight: '700' }}>OOG Terminal</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Sign in with your Worker ID</p>
        </div>

        {pendingApproval && (
          <div style={{ 
            background: '#fef3c7', 
            color: '#92400e', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            fontSize: '0.85rem',
            textAlign: 'center',
            border: '2px solid #f59e0b'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '4px' }}>⏳</div>
            <strong>Account Pending Approval</strong>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem' }}>
              Your account is waiting for admin approval.
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#78350f' }}>
              Worker ID: <strong>{workerId || 'Not entered'}</strong>
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#78350f' }}>
              Please check your email for updates.
            </p>
            {showResend && (
              <button
                onClick={handleResendNotification}
                style={{
                  marginTop: '8px',
                  padding: '4px 16px',
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  cursor: 'pointer'
                }}
              >
                Resend Notification
              </button>
            )}
            <div style={{ marginTop: '8px' }}>
              <Link href="/signup" style={{ color: '#1e6f3f', textDecoration: 'underline', fontSize: '0.7rem' }}>
                Create a different account
              </Link>
            </div>
          </div>
        )}

        {accountDenied && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#991b1b', 
            padding: '12px 16px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            fontSize: '0.85rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px' }}>❌</div>
            <strong>Account Denied</strong>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem' }}>
              Your account request has been denied.
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem' }}>
              Please contact support for assistance.
            </p>
          </div>
        )}

        {!pendingApproval && !accountDenied && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '0.75rem', color: '#4b5563' }}>Worker ID</label>
              <input
                type="text"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value.toUpperCase().trim())}
                placeholder="e.g., ADMIN001"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
                required
              />
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
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? '#6c757d' : '#1e6f3f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}
        
        {!pendingApproval && !accountDenied && (
          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>
            <Link href="/signup" style={{ color: '#1e6f3f', textDecoration: 'underline' }}>Don't have an account? Sign up</Link>
          </div>
        )}
        {!pendingApproval && (
          <div style={{ marginTop: "8px", textAlign: "center", fontSize: "0.8rem" }}>
            <Link href="/auth/reset-password" style={{ color: "#64748b", textDecoration: "underline" }}>Forgot Password?</Link>
          </div>
        )}
        
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.65rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
          Developed by <strong>O'Bour Dev</strong> © 2026
        </div>
      </div>
    </div>
  )
}
