"use client"
import React, { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { useDarkMode } from '@/hooks/useDarkMode'
import { DashboardNavigation } from './components/DashboardNavigation'
import { supabase } from '@/lib/db'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { darkMode, toggleDarkMode } = useDarkMode()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchUser()
    } else if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [session, status])

  const fetchUser = async () => {
    try {
      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('id', session?.user?.id)
        .single()
      
      if (error) throw error
      setUser(data)
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">OOG Terminal</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {session?.user?.name || 'User'}
            </p>
          </div>
          <DashboardNavigation />
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-md"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {pathname === '/dashboard' ? 'Dashboard' : pathname.split('/').pop()}
            </h2>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? '🌞' : '🌙'}
              </button>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
