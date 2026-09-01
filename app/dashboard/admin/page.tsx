"use client"
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    console.log('🔍 Admin page - Session:', session)
    console.log('🔍 Admin page - Status:', status)
    
    if (status === 'unauthenticated') {
      console.log('🔴 Not authenticated, redirecting to login')
      router.push('/login')
      return
    }
    
    if (session?.user?.role !== 'officer') {
      console.log('🔴 Not officer, current role:', session?.user?.role)
      router.push('/dashboard')
      return
    }
    
    fetchUsers()
  }, [session, status])

  const fetchUsers = async () => {
    console.log('📡 Fetching users...')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/users')
      console.log('📡 Response status:', res.status)
      const data = await res.json()
      console.log('📡 Users data:', data)
      
      if (res.ok) {
        setUsers(data)
      } else {
        setError(data.error || 'Failed to fetch users')
      }
    } catch (err: any) {
      console.error('❌ Fetch error:', err)
      setError('Network error: ' + err.message)
    }
    setLoading(false)
  }

  const handleApprove = async (userId: string) => {
    if (!confirm('Approve this user?')) return
    setProcessing(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'approve' })
      })
      const data = await res.json()
      console.log('Approve response:', data)
      if (res.ok) {
        alert('✅ User approved successfully!')
        fetchUsers()
      } else {
        alert('❌ ' + (data.error || 'Failed to approve'))
      }
    } catch (err) {
      alert('❌ Network error')
    }
    setProcessing(false)
  }

  const handleDeny = async (userId: string) => {
    const reason = prompt('Enter reason for denial:')
    if (reason === null) return
    if (!reason.trim()) {
      alert('Please provide a reason')
      return
    }
    setProcessing(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          action: 'deny', 
          reason: reason.trim() 
        })
      })
      const data = await res.json()
      console.log('Deny response:', data)
      if (res.ok) {
        alert('✅ User denied!')
        fetchUsers()
      } else {
        alert('❌ ' + (data.error || 'Failed to deny'))
      }
    } catch (err) {
      alert('❌ Network error')
    }
    setProcessing(false)
  }

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading...</div>
      </div>
    )
  }

  // Show if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Please log in to access admin panel.</p>
        <button onClick={() => router.push('/login')}>Go to Login</button>
      </div>
    )
  }

  // Show if not officer
  if (session?.user?.role !== 'officer') {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
        <p>Access denied. Officers only.</p>
        <p>Your role: {session?.user?.role || 'none'}</p>
        <button onClick={() => router.push('/dashboard')}>Back to Dashboard</button>
      </div>
    )
  }

  const pendingUsers = users.filter((u: any) => u.approved === false && !u.rejectionReason)
  const approvedUsers = users.filter((u: any) => u.approved === true)
  const deniedUsers = users.filter((u: any) => u.rejectionReason)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>👑 Admin Panel</h1>
        <button 
          onClick={fetchUsers}
          style={{
            padding: '6px 16px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
      </div>
      
      <div style={{ margin: '20px 0', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ background: '#fef3c7', padding: '8px 16px', borderRadius: '8px' }}>
          ⏳ Pending: {pendingUsers.length}
        </div>
        <div style={{ background: '#d1fae5', padding: '8px 16px', borderRadius: '8px' }}>
          ✅ Approved: {approvedUsers.length}
        </div>
        <div style={{ background: '#fee2e2', padding: '8px 16px', borderRadius: '8px' }}>
          ❌ Denied: {deniedUsers.length}
        </div>
        <div style={{ background: '#e2e8f0', padding: '8px 16px', borderRadius: '8px' }}>
          📊 Total: {users.length}
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          Error: {error}
        </div>
      )}

      {users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          No users found in database.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {users.map((user: any) => (
            <div
              key={user.id}
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <strong>{user.name || 'No name'}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {user.userId}</span>
                  {user.approved === true && (
                    <span style={{ fontSize: '0.6rem', background: '#10b981', color: 'white', padding: '2px 10px', borderRadius: '12px' }}>✅ Approved</span>
                  )}
                  {user.approved === false && user.rejectionReason && (
                    <span style={{ fontSize: '0.6rem', background: '#dc2626', color: 'white', padding: '2px 10px', borderRadius: '12px' }}>❌ Denied</span>
                  )}
                  {user.approved === false && !user.rejectionReason && (
                    <span style={{ fontSize: '0.6rem', background: '#f59e0b', color: 'white', padding: '2px 10px', borderRadius: '12px' }}>⏳ Pending</span>
                  )}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                  {user.email} • Role: {user.role}
                </div>
                {user.rejectionReason && (
                  <div style={{ fontSize: '0.65rem', color: '#dc2626', marginTop: '4px' }}>
                    Reason: {user.rejectionReason}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {user.approved === false && !user.rejectionReason && (
                  <>
                    <button
                      onClick={() => handleApprove(user.id)}
                      disabled={processing}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        background: '#10b981',
                        color: 'white',
                        fontSize: '0.7rem',
                        cursor: processing ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        opacity: processing ? 0.6 : 1
                      }}
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleDeny(user.id)}
                      disabled={processing}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        background: '#dc2626',
                        color: 'white',
                        fontSize: '0.7rem',
                        cursor: processing ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        opacity: processing ? 0.6 : 1
                      }}
                    >
                      ❌ Deny
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
