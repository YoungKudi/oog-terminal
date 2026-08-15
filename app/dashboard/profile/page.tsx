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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    setLoading(false)
  }, [status, router])

  if (loading || status === 'loading') {
    return <div style={{ padding: '20px' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
        👤 User Profile
      </h1>
      <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
        Worker ID: {session?.user?.userId}
      </p>
      <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
        Email: {session?.user?.email || 'Not set'}
      </p>
    </div>
  )
}
