"use client"
import React, { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useToast } from '@/hooks/useToast'

export default function UserProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { isDarkMode } = useDarkMode()
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    userId: session?.user?.userId || '',
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    role: session?.user?.role || 'Operator',
    shift: session?.user?.shift || 'A',
    joinDate: '2024-01-15'
  })

  const handleSave = async () => {
    try {
      // In a real app, you'd call an API to update the user profile
      showToast('Profile updated successfully!', 'success')
      setIsEditing(false)
    } catch (error) {
      showToast('Failed to update profile', 'error')
    }
  }

  if (!session) {
    router.push('/login')
    return null
  }

  const bgColor = isDarkMode ? '#0a0e17' : '#f5f7fb'
  const cardBg = isDarkMode ? '#1e293b' : 'white'
  const textColor = isDarkMode ? '#e2e8f0' : '#1e293b'
  const subTextColor = isDarkMode ? '#94a3b8' : '#64748b'
  const borderColor = isDarkMode ? '#334155' : '#e2e8f0'

  return (
    <div style={{
      minHeight: '100vh',
      background: bgColor,
      padding: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        background: cardBg,
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: `1px solid ${borderColor}`
      }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            color: subTextColor,
            cursor: 'pointer',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ← Back to Dashboard
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#1e6f3f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: '32px',
            color: 'white'
          }}>
            {userData.userId.charAt(0).toUpperCase()}
          </div>
          <h1 style={{
            color: textColor,
            fontSize: '1.5rem',
            margin: '0 0 4px 0'
          }}>
            {userData.name || userData.userId}
          </h1>
          <p style={{ color: subTextColor, fontSize: '0.85rem' }}>
            {userData.role} • Shift {userData.shift}
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div style={{
              padding: '12px',
              background: isDarkMode ? '#0f172a' : '#f8fafc',
              borderRadius: '8px'
            }}>
              <p style={{ fontSize: '0.7rem', color: subTextColor, margin: '0 0 2px 0' }}>
                USER ID
              </p>
              <p style={{ fontSize: '0.9rem', color: textColor, margin: 0, fontWeight: '600' }}>
                {userData.userId}
              </p>
            </div>
            <div style={{
              padding: '12px',
              background: isDarkMode ? '#0f172a' : '#f8fafc',
              borderRadius: '8px'
            }}>
              <p style={{ fontSize: '0.7rem', color: subTextColor, margin: '0 0 2px 0' }}>
                JOINED
              </p>
              <p style={{ fontSize: '0.9rem', color: textColor, margin: 0, fontWeight: '600' }}>
                {userData.joinDate}
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: textColor, fontSize: '0.9rem', margin: '0 0 12px 0' }}>
            Profile Details
          </h3>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.75rem', color: subTextColor, display: 'block', marginBottom: '4px' }}>
              Full Name
            </label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData({...userData, name: e.target.value})}
              disabled={!isEditing}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: isDarkMode ? '#0f172a' : '#f8fafc',
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                color: textColor,
                fontSize: '0.9rem',
                opacity: isEditing ? 1 : 0.7
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.75rem', color: subTextColor, display: 'block', marginBottom: '4px' }}>
              Email
            </label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({...userData, email: e.target.value})}
              disabled={!isEditing}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: isDarkMode ? '#0f172a' : '#f8fafc',
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                color: textColor,
                fontSize: '0.9rem',
                opacity: isEditing ? 1 : 0.7
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: subTextColor, display: 'block', marginBottom: '4px' }}>
                Role
              </label>
              <select
                value={userData.role}
                onChange={(e) => setUserData({...userData, role: e.target.value})}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: isDarkMode ? '#0f172a' : '#f8fafc',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  color: textColor,
                  fontSize: '0.9rem',
                  opacity: isEditing ? 1 : 0.7
                }}
              >
                <option value="Operator">Operator</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: subTextColor, display: 'block', marginBottom: '4px' }}>
                Shift
              </label>
              <select
                value={userData.shift}
                onChange={(e) => setUserData({...userData, shift: e.target.value})}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: isDarkMode ? '#0f172a' : '#f8fafc',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  color: textColor,
                  fontSize: '0.9rem',
                  opacity: isEditing ? 1 : 0.7
                }}
              >
                <option value="A">A (06:00-14:00)</option>
                <option value="B">B (14:00-22:00)</option>
                <option value="C">C (22:00-06:00)</option>
                <option value="D">D (Flex)</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  padding: '8px 20px',
                  background: 'transparent',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  color: subTextColor,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '8px 20px',
                  background: '#1e6f3f',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '8px 20px',
                background: '#1e6f3f',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Edit Profile
            </button>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{
              padding: '8px 20px',
              background: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
