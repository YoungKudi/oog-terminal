'use client'
import React, { useState } from 'react'
import { supabase } from '@/lib/db'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://oog-terminal.vercel.app/auth/update-password',
      })
      
      if (error) throw error
      
      setSuccess(true)
      setMessage('✅ Password reset link sent to your email!')
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '40px' }}>🔑</span>
          <h1 style={{ marginTop: '8px', fontSize: '24px', fontWeight: '700' }}>Reset Password</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Enter your email to receive a reset link</p>
        </div>
        
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>❌ {error}</div>}
        {message && <div style={{ background: '#d1fae5', color: '#059669', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>✅ {message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '0.75rem', color: '#4b5563' }}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="your@email.com"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || success}
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: loading ? '#6c757d' : (success ? '#10b981' : '#1e6f3f'), 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '1rem', 
              fontWeight: '600', 
              cursor: loading ? 'not-allowed' : 'pointer' 
            }}
          >
            {loading ? 'Sending...' : (success ? '✅ Sent!' : 'Send Reset Link')}
          </button>
        </form>
        
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>
          <Link href="/login" style={{ color: '#1e6f3f', textDecoration: 'underline' }}>← Back to Login</Link>
        </div>
      </div>
    </div>
  )
}
