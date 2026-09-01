"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Queue', href: '/dashboard/queue' },
  { name: 'Receivals', href: '/dashboard/receivals' },
  { name: 'Tallies', href: '/dashboard/tallies' },
  { name: 'Devanning', href: '/dashboard/devanning' },
  { name: 'Unstuffed', href: '/dashboard/unstuffed' },
  { name: 'Clearance', href: '/dashboard/clearance' },
]

export function DashboardNavigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isOfficer = session?.user?.role === 'officer'

  return (
    <nav className="mt-4">
      <ul className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {item.name}
              </Link>
            </li>
          )
        })}
        {isOfficer && (
          <li>
            <Link
              href="/dashboard/admin"
              className={`block px-4 py-2 rounded-md transition-colors ${
                pathname === '/dashboard/admin'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              👑 Admin Panel
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}
// Add this to the navItems array
{ name: '👑 Admin Panel', href: '/dashboard/admin' },
