"use client"
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getColor } from '@/lib/utils'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useToast } from '@/hooks/useToast'

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isDarkMode } = useDarkMode()
  const { showToast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('pending')

  const isAdmin = session?.user?.role === 'admin'
  const isOfficer = session?.user?.role === 'officer'
  const canAccess = isAdmin || isOfficer

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated' && !canAccess) {
      router.push('/dashboard')
      return
    }
    if (status === 'authenticated' && canAccess) {
      fetchUsers()
    }
  }, [session, status, router, canAccess])

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
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'approve' })
      })
      if (res.ok) {
        showToast('✅ User approved')
        fetchUsers()
      } else {
        const data = await res.json()
        showToast('❌ ' + (data.error || 'Failed'))
      }
    } catch (error) {
      showToast('❌ Network error')
    }
  }

  const handleDeny = async (userId: string) => {
    const reason = prompt('Reason for denial:')
    if (reason === null) return
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'deny', reason })
      })
      if (res.ok) {
        showToast('✅ User denied')
        fetchUsers()
      } else {
        const data = await res.json()
        showToast('❌ ' + (data.error || 'Failed'))
      }
    } catch (error) {
      showToast('❌ Network error')
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!isAdmin) {
      showToast('❌ Only Admin can change roles')
      return
    }
    if (!confirm(`Change role to "${newRole}"?`)) return
    
    try {
      const res = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole })
      })
      if (res.ok) {
        showToast('✅ Role updated')
        fetchUsers()
      } else {
        const data = await res.json()
        showToast('❌ ' + (data.error || 'Failed'))
      }
    } catch (error) {
      showToast('❌ Network error')
    }
  }

  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#64748b', '#94a3b8')
  const cardBg = getColor(isDarkMode, 'white', '#111827')
  const borderColor = getColor(isDarkMode, '#eef2f6', '#1f2937')

  if (status === 'loading' || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #1e6f3f', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (!canAccess) {
    return <div style={{ padding: '20px', color: '#dc2626' }}>Access denied.</div>
  }

  const filteredUsers = users.filter(user => {
    if (filter === 'pending') return user.approved === false && !user.rejectionReason
    if (filter === 'approved') return user.approved === true
    if (filter === 'denied') return user.rejectionReason
    return true
  })

  const pendingCount = users.filter(u => u.approved === false && !u.rejectionReason).length

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ color: textColor, fontSize: '1.2rem', margin: 0 }}>
            👑 User Management {isAdmin && '(Admin)'}
          </h2>
          <p style={{ color: mutedColor, fontSize: '0.7rem', margin: '4px 0 0 0' }}>
            {pendingCount} pending approvals
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['pending', 'approved', 'denied', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                border: filter === f ? '2px solid #1e6f3f' : '1px solid #d1d5db',
                background: filter === f ? '#f0fdf4' : 'transparent',
                color: filter === f ? '#1e6f3f' : mutedColor,
                fontWeight: filter === f ? '600' : '400',
                fontSize: '0.7rem',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {f} {f === 'pending' && pendingCount > 0 && `(${pendingCount})`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: mutedColor }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>📭</div>
            <p>No {filter} users found</p>
          </div>
        ) : (
          filteredUsers.map(user => (
            <div
              key={user.id}
              style={{
                background: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <strong style={{ color: textColor, fontSize: '0.9rem' }}>{user.name}</strong>
                  <span style={{ fontSize: '0.65rem', color: mutedColor }}>ID: {user.userId}</span>
                  {user.approved ? (
                    <span style={{ fontSize: '0.55rem', background: '#10b981', color: 'white', padding: '1px 10px', borderRadius: '12px' }}>✅ Approved</span>
                  ) : user.rejectionReason ? (
                    <span style={{ fontSize: '0.55rem', background: '#dc2626', color: 'white', padding: '1px 10px', borderRadius: '12px' }}>❌ Denied</span>
                  ) : (
                    <span style={{ fontSize: '0.55rem', background: '#f59e0b', color: 'white', padding: '1px 10px', borderRadius: '12px' }}>⏳ Pending</span>
                  )}
                  <span style={{
                    fontSize: '0.55rem',
                    background: user.role === 'admin' ? '#8b5cf6' : user.role === 'officer' ? '#1e6f3f' : '#64748b',
                    color: 'white',
                    padding: '1px 10px',
                    borderRadius: '12px',
                    textTransform: 'uppercase'
                  }}>
                    {user.role}
                  </span>
                </div>
                <div style={{ fontSize: '0.65rem', color: mutedColor, marginTop: '2px' }}>
                  {user.email} • {user.phone || 'No phone'}
                </div>
                {user.rejectionReason && (
                  <div style={{ fontSize: '0.6rem', color: '#dc2626', marginTop: '2px' }}>
                    Reason: {user.rejectionReason}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                {!user.approved && !user.rejectionReason && (
                  <>
                    <button
                      onClick={() => handleApprove(user.id)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        border: 'none',
                        background: '#10b981',
                        color: 'white',
                        fontSize: '0.65rem',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleDeny(user.id)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        border: 'none',
                        background: '#dc2626',
                        color: 'white',
                        fontSize: '0.65rem',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      ❌ Deny
                    </button>
                  </>
                )}
                {/* Only ADMIN can change roles */}
                {isAdmin && user.role !== 'admin' && user.approved && (
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '20px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.65rem',
                      cursor: 'pointer',
                      background: 'white'
                    }}
                  >
                    <option value="user">User</option>
                    <option value="officer">Officer</option>
                  </select>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
