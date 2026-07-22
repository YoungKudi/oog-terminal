"use client"
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/lib/db'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isDarkMode } = useDarkMode()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (session?.user?.id) {
      fetchUserProfile()
    }
  }, [session, status])

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('id', session?.user?.id)
        .single()

      if (error) throw error
      
      setUserData(data)
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      showToast('Failed to load profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from('User')
        .update({
          name: formData.name,
          phone: formData.phone,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', session?.user?.id)

      if (error) throw error

      setUserData(prev => ({ ...prev, ...formData }))
      setEditing(false)
      showToast('Profile updated successfully!', 'success')
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast('Failed to update profile', 'error')
    }
  }

  if (loading || status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          border: '4px solid #e2e8f0', 
          borderTop: '4px solid #1e6f3f', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto',
      padding: '20px',
      background: isDarkMode ? '#1e293b' : 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
        paddingBottom: '16px'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          color: isDarkMode ? '#e2e8f0' : '#1e293b'
        }}>
          👤 User Profile
        </h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: '8px 16px',
              background: '#1e6f3f',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#15803d'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#1e6f3f'}
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Worker ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ 
            minWidth: '120px', 
            fontWeight: '500',
            color: isDarkMode ? '#94a3b8' : '#64748b'
          }}>
            Worker ID
          </label>
          <div style={{ 
            flex: 1,
            padding: '8px 12px',
            background: isDarkMode ? '#0f172a' : '#f1f5f9',
            borderRadius: '8px',
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
            fontFamily: 'monospace'
          }}>
            {userData?.userId || session?.user?.userId}
          </div>
        </div>

        {/* Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ 
            minWidth: '120px', 
            fontWeight: '500',
            color: isDarkMode ? '#94a3b8' : '#64748b'
          }}>
            Full Name
          </label>
          {editing ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                borderRadius: '8px',
                background: isDarkMode ? '#0f172a' : 'white',
                color: isDarkMode ? '#e2e8f0' : '#1e293b'
              }}
            />
          ) : (
            <div style={{ 
              flex: 1,
              padding: '8px 12px',
              background: isDarkMode ? '#0f172a' : '#f1f5f9',
              borderRadius: '8px',
              color: isDarkMode ? '#e2e8f0' : '#1e293b'
            }}>
              {userData?.name || 'Not set'}
            </div>
          )}
        </div>

        {/* Email */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ 
            minWidth: '120px', 
            fontWeight: '500',
            color: isDarkMode ? '#94a3b8' : '#64748b'
          }}>
            Email
          </label>
          <div style={{ 
            flex: 1,
            padding: '8px 12px',
            background: isDarkMode ? '#0f172a' : '#f1f5f9',
            borderRadius: '8px',
            color: isDarkMode ? '#e2e8f0' : '#1e293b'
          }}>
            {userData?.email}
          </div>
        </div>

        {/* Phone */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ 
            minWidth: '120px', 
            fontWeight: '500',
            color: isDarkMode ? '#94a3b8' : '#64748b'
          }}>
            Phone
          </label>
          {editing ? (
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                borderRadius: '8px',
                background: isDarkMode ? '#0f172a' : 'white',
                color: isDarkMode ? '#e2e8f0' : '#1e293b'
              }}
            />
          ) : (
            <div style={{ 
              flex: 1,
              padding: '8px 12px',
              background: isDarkMode ? '#0f172a' : '#f1f5f9',
              borderRadius: '8px',
              color: isDarkMode ? '#e2e8f0' : '#1e293b'
            }}>
              {userData?.phone || 'Not set'}
            </div>
          )}
        </div>

        {/* Role */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ 
            minWidth: '120px', 
            fontWeight: '500',
            color: isDarkMode ? '#94a3b8' : '#64748b'
          }}>
            Role
          </label>
          <div style={{ 
            flex: 1,
            padding: '8px 12px',
            background: isDarkMode ? '#0f172a' : '#f1f5f9',
            borderRadius: '8px',
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
            textTransform: 'capitalize'
          }}>
            <span style={{
              padding: '2px 12px',
              borderRadius: '12px',
              background: userData?.role === 'admin' ? '#dc2626' : 
                        userData?.role === 'officer' ? '#2563eb' : '#64748b',
              color: 'white',
              fontSize: '0.75rem'
            }}>
              {userData?.role || 'user'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {editing && (
          <div style={{ 
            display: 'flex', 
            gap: '12px',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
          }}>
            <button
              onClick={handleUpdate}
              style={{
                padding: '8px 24px',
                background: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#16a34a'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#22c55e'}
            >
              💾 Save Changes
            </button>
            <button
              onClick={() => {
                setEditing(false)
                setFormData({
                  name: userData?.name || '',
                  phone: userData?.phone || '',
                })
              }}
              style={{
                padding: '8px 24px',
                background: '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#475569'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#64748b'}
            >
              ❌ Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
