"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function DashboardNavigation() {
  const pathname = usePathname()
  
  return (
    <nav style={{ background: '#1e293b', padding: '8px 16px', display: 'flex', gap: '16px', overflowX: 'auto' }}>
      <Link href="/dashboard" style={{ color: pathname === '/dashboard' ? '#8b5cf6' : '#94a3b8', textDecoration: 'none', fontSize: '0.8rem' }}>Dashboard</Link>
      <Link href="/dashboard/profile" style={{ color: pathname === '/dashboard/profile' ? '#8b5cf6' : '#94a3b8', textDecoration: 'none', fontSize: '0.8rem' }}>Profile</Link>
    </nav>
  )
}
