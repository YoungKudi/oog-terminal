"use client"
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        background: '#f5f7fb'
      }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          border: '4px solid #e2e8f0', 
          borderTop: '4px solid #1e6f3f', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }} />
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!session) return null

  return <>{children}</>
}
