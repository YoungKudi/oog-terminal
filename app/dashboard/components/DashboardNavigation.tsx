'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TabWithCount } from '@/components/common/TabWithCount';

const tabs = [
  { id: 'queue', label: 'Queue', path: '/dashboard/queue' },
  { id: 'receivals', label: 'Receivals', path: '/dashboard/receivals' },
  { id: 'tallies', label: 'Tallies', path: '/dashboard/tallies' },
  { id: 'devanning', label: 'Devanning', path: '/dashboard/devanning' },
  { id: 'unstuffed', label: 'Unstuffed', path: '/dashboard/unstuffed' },
  { id: 'evacuation', label: 'Evacuation', path: '/dashboard/evacuation' },
  { id: 'locations', label: 'Locations', path: '/dashboard/locations' },
  { id: 'contacts', label: 'Contacts', path: '/dashboard/contacts' },
  { id: 'backup', label: 'Backup', path: '/dashboard/backup' },
  { id: 'reports', label: 'Reports', path: '/dashboard/reports' },
];

export function DashboardNavigation() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Show first 7 tabs, rest in "More" dropdown
  const visibleTabs = tabs.slice(0, 7);
  const moreTabs = tabs.slice(7);

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 space-x-1 overflow-x-auto scrollbar-hide">
          {visibleTabs.map((tab) => (
            <Link key={tab.id} href={tab.path}>
              <TabWithCount
                id={tab.id}
                label={tab.label}
                isActive={pathname === tab.path}
              />
            </Link>
          ))}

          {/* More Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                isMoreOpen || moreTabs.some(tab => pathname === tab.path)
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              More ▾
            </button>

            {isMoreOpen && (
              <>
                {/* Click outside to close */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMoreOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {moreTabs.map((tab) => (
                    <Link key={tab.id} href={tab.path}>
                      <div
                        className={`px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ${
                          pathname === tab.path
                            ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                        onClick={() => setIsMoreOpen(false)}
                      >
                        {tab.label}
                      </div>
                    </Link>
                  ))}
                  
                  {/* Profile Link in More Dropdown */}
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                    <Link href="/dashboard/profile">
                      <div
                        className={`px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center space-x-2 ${
                          pathname === '/dashboard/profile'
                            ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                        onClick={() => setIsMoreOpen(false)}
                      >
                        <span>👤</span>
                        <span>Profile</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
