'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
        style={{ fontSize: '1.2rem', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '8px',
            height: '8px',
            background: '#ef4444',
            borderRadius: '50%'
          }}></span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-96 max-h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            width: '320px',
            maxHeight: '400px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '1px solid #e5e7eb',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: '600', margin: 0 }}>Notifications</h3>
            <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: '4px 0 0 0' }}>
              {notifications.length === 0 ? 'No notifications' : `${unreadCount} unread`}
            </p>
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', fontSize: '0.75rem' }}>
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6' }}
                >
                  <p style={{ fontSize: '0.8rem', margin: 0 }}>{notification.title}</p>
                  <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: '2px 0 0 0' }}>{notification.message}</p>
                </div>
              ))
            )}
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <Link
              href="/dashboard/profile"
              style={{ fontSize: '0.7rem', color: '#2563eb', textDecoration: 'none' }}
              onClick={() => setIsOpen(false)}
            >
              View Profile →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
