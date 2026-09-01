"use client"
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [processing, setProcessing] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showDenyModal, setShowDenyModal] = useState(false)
  const [denyReason, setDenyReason] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (session?.user?.role !== 'officer') {
      router.push('/dashboard')
      return
    }
    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
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
      if (res.ok) {
        alert('✅ User approved successfully')
        fetchUsers()
      } else {
        const data = await res.json()
        alert('❌ ' + (data.error || 'Failed to approve'))
      }
    } catch (error) {
      alert('❌ Network error')
    }
    setProcessing(false)
  }

  const handleDeny = async () => {
    if (!selectedUser || !denyReason.trim()) {
      alert('Please provide a reason')
      return
    }
    setProcessing(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: selectedUser.id, 
          action: 'deny',
          reason: denyReason 
        })
      })
      if (res.ok) {
        alert('✅ User denied')
        setShowDenyModal(false)
        setDenyReason('')
        setSelectedUser(null)
        fetchUsers()
      } else {
        const data = await res.json()
        alert('❌ ' + (data.error || 'Failed to deny'))
      }
    } catch (error) {
      alert('❌ Network error')
    }
    setProcessing(false)
  }

  if (status === 'loading' || loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
  }

  if (session?.user?.role !== 'officer') {
    return <div style={{ padding: '20px', color: 'red' }}>Access denied. Officers only.</div>
  }

  const filteredUsers = users.filter(user => {
    if (filter === 'pending') return user.approved === false && !user.rejectionReason
    if (filter === 'approved') return user.approved === true
    if (filter === 'denied') return user.rejectionReason
    return true
  })

  const pendingCount = users.filter(u => u.approved === false && !u.rejectionReason).length

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>👑 User Management</h2>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
          {pendingCount} pending approvals
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['pending', 'approved', 'denied', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: filter === f ? '2px solid #1e6f3f' : '1px solid #d1d5db',
              background: filter === f ? '#f0fdf4' : 'transparent',
              color: filter === f ? '#1e6f3f' : '#64748b',
              fontWeight: filter === f ? '600' : '400',
              fontSize: '0.8rem',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {f} {f === 'pending' && pendingCount > 0 && `(${pendingCount})`}
          </button>
        ))}
      </div>

      {filteredUsers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          <p>No {filter} users found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredUsers.map(user => (
            <div
              key={user.id}
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong>{user.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {user.userId}</span>
                  {user.approved ? (
                    <span style={{ fontSize: '0.65rem', background: '#10b981', color: 'white', padding: '2px 12px', borderRadius: '12px' }}>✅ Approved</span>
                  ) : user.rejectionReason ? (
                    <span style={{ fontSize: '0.65rem', background: '#dc2626', color: 'white', padding: '2px 12px', borderRadius: '12px' }}>❌ Denied</span>
                  ) : (
                    <span style={{ fontSize: '0.65rem', background: '#f59e0b', color: 'white', padding: '2px 12px', borderRadius: '12px' }}>⏳ Pending</span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  {user.email} • {user.phone || 'No phone'} • Role: {user.role}
                </div>
                {user.rejectionReason && (
                  <div style={{ fontSize: '0.7rem', color: '#dc2626', marginTop: '4px' }}>
                    Reason: {user.rejectionReason}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!user.approved && !user.rejectionReason && (
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
                        fontSize: '0.75rem',
                        cursor: processing ? 'not-allowed' : 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user)
                        setShowDenyModal(true)
                      }}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        background: '#dc2626',
                        color: 'white',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: '600'
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

      {/* Deny Modal */}
      {showDenyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3>❌ Deny User</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
              User: <strong>{selectedUser?.name}</strong> ({selectedUser?.userId})
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#4b5563', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>
                Reason for denial *
              </label>
              <textarea
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                placeholder="Provide a reason for denying this user..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.75rem',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleDeny}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  color: 'white',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Deny
              </button>
              <button
                onClick={() => {
                  setShowDenyModal(false)
                  setDenyReason('')
                  setSelectedUser(null)
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: 'transparent',
                  color: '#64748b',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
