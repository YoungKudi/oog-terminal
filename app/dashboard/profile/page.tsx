"use client"
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/db'
import { getColor } from '@/lib/utils'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useToast } from '@/hooks/useToast'

export default function UserProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isDarkMode } = useDarkMode()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    userId: '',
    phone: '',
    role: '',
    createdAt: ''
  })
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswordChange, setShowPasswordChange] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProfile()
    }
  }, [session])

  const fetchUserProfile = async () => {
    if (!session?.user?.id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) throw error

      setUserData({
        id: data.id,
        name: data.name || '',
        email: data.email || '',
        userId: data.userId || '',
        phone: data.phone || '',
        role: data.role || 'user',
        createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'
      })
      setFormData({
        name: data.name || '',
        phone: data.phone || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      showToast('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!session?.user?.id) return

    try {
      const updates: any = {}
      if (formData.name !== userData.name) updates.name = formData.name
      if (formData.phone !== userData.phone) updates.phone = formData.phone

      if (Object.keys(updates).length === 0) {
        showToast('No changes to save')
        return
      }

      const { error } = await supabase
        .from('User')
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('id', session.user.id)

      if (error) throw error

      setUserData({ ...userData, ...updates })
      setIsEditing(false)
      showToast('✅ Profile updated successfully!')
      fetchUserProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast('❌ Failed to update profile')
    }
  }

  const handleChangePassword = async () => {
    if (!session?.user?.id) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('❌ Passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      showToast('❌ Password must be at least 6 characters')
      return
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await response.json()
      if (response.ok) {
        showToast('✅ Password updated successfully!')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowPasswordChange(false)
      } else {
        showToast('❌ ' + (data.error || 'Failed to update password'))
      }
    } catch (error) {
      showToast('❌ Network error')
    }
  }

  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#64748b', '#94a3b8')
  const bgColor = getColor(isDarkMode, '#f8fafc', '#0f172a')
  const cardBg = getColor(isDarkMode, 'white', '#1e293b')
  const borderColor = getColor(isDarkMode, '#e2e8f0', '#334155')
  const inputBg = getColor(isDarkMode, 'white', '#0a0e17')
  const inputText = getColor(isDarkMode, '#1e293b', '#e2e8f0')

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #1e6f3f', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      <div style={{ 
        background: cardBg, 
        borderRadius: '16px', 
        padding: '24px', 
        border: `1px solid ${borderColor}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#1e6f3f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            color: 'white',
            fontWeight: '700'
          }}>
            {userData.name?.charAt(0)?.toUpperCase() || userData.userId?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 style={{ color: textColor, fontSize: '1.2rem', margin: 0 }}>{userData.name || userData.userId}</h2>
            <p style={{ color: mutedColor, fontSize: '0.8rem', margin: 0 }}>{userData.role?.toUpperCase() || 'User'}</p>
            <p style={{ color: mutedColor, fontSize: '0.7rem', margin: 0 }}>Worker ID: {userData.userId}</p>
          </div>
        </div>

        {/* Profile Info */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.6rem', color: mutedColor, fontWeight: '600', textTransform: 'uppercase' }}>Email</label>
              <p style={{ color: textColor, fontSize: '0.85rem', margin: '4px 0 0 0' }}>{userData.email}</p>
            </div>
            <div>
              <label style={{ fontSize: '0.6rem', color: mutedColor, fontWeight: '600', textTransform: 'uppercase' }}>Phone</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: `1px solid ${borderColor}`,
                    fontSize: '0.8rem',
                    background: inputBg,
                    color: inputText,
                    marginTop: '4px'
                  }}
                />
              ) : (
                <p style={{ color: textColor, fontSize: '0.85rem', margin: '4px 0 0 0' }}>{userData.phone || 'Not set'}</p>
              )}
            </div>
            <div>
              <label style={{ fontSize: '0.6rem', color: mutedColor, fontWeight: '600', textTransform: 'uppercase' }}>Role</label>
              <p style={{ color: textColor, fontSize: '0.85rem', margin: '4px 0 0 0', textTransform: 'capitalize' }}>{userData.role}</p>
            </div>
            <div>
              <label style={{ fontSize: '0.6rem', color: mutedColor, fontWeight: '600', textTransform: 'uppercase' }}>Joined</label>
              <p style={{ color: textColor, fontSize: '0.85rem', margin: '4px 0 0 0' }}>{userData.createdAt}</p>
            </div>
          </div>

          {isEditing && (
            <div style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '0.6rem', color: mutedColor, fontWeight: '600', textTransform: 'uppercase' }}>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                  fontSize: '0.85rem',
                  background: inputBg,
                  color: inputText,
                  marginTop: '4px'
                }}
              />
            </div>
          )}
        </div>

        {/* Password Change */}
        {showPasswordChange && (
          <div style={{ 
            marginBottom: '16px', 
            padding: '16px', 
            background: bgColor, 
            borderRadius: '12px',
            border: `1px solid ${borderColor}`
          }}>
            <h4 style={{ color: textColor, margin: '0 0 12px 0', fontSize: '0.9rem' }}>Change Password</h4>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '0.6rem', color: mutedColor, fontWeight: '600', textTransform: 'uppercase' }}>Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                  fontSize: '0.8rem',
                  background: inputBg,
                  color: inputText,
                  marginTop: '4px'
                }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '0.6rem', color: mutedColor, fontWeight: '600', textTransform: 'uppercase' }}>New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                  fontSize: '0.8rem',
                  background: inputBg,
                  color: inputText,
                  marginTop: '4px'
                }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '0.6rem', color: mutedColor, fontWeight: '600', textTransform: 'uppercase' }}>Confirm Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                  fontSize: '0.8rem',
                  background: inputBg,
                  color: inputText,
                  marginTop: '4px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleChangePassword}
                style={{
                  padding: '6px 16px',
                  background: '#1e6f3f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Update Password
              </button>
              <button
                onClick={() => setShowPasswordChange(false)}
                style={{
                  padding: '6px 16px',
                  background: 'transparent',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  color: mutedColor
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: `1px solid ${borderColor}`, paddingTop: '16px' }}>
          {isEditing ? (
            <>
              <button
                onClick={handleUpdateProfile}
                style={{
                  padding: '8px 20px',
                  background: '#1e6f3f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                💾 Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setFormData({ name: userData.name, phone: userData.phone })
                }}
                style={{
                  padding: '8px 20px',
                  background: 'transparent',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  color: mutedColor
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '8px 20px',
                  background: '#1e6f3f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ✏️ Edit Profile
              </button>
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                style={{
                  padding: '8px 20px',
                  background: 'transparent',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  color: textColor
                }}
              >
                🔑 Change Password
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
