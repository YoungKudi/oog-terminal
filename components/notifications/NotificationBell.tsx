'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface NotificationItem {
  id: string;
  action: string;
  title: string;
  message: string;
  containerNumber: string | null;
  createdAt: string;
  userName: string;
}

const POLL_INTERVAL = 10000; // 10 seconds

export function NotificationBell() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastSeenRef = useRef<string>('');

  // Load "last seen" timestamp from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('oog_last_seen_notification')
    if (stored) {
      lastSeenRef.current = stored
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?limit=30')
      if (!res.ok) return

      const data = await res.json()
      if (!Array.isArray(data)) return

      setNotifications(data)

      // Count unread based on last seen timestamp
      const lastSeen = lastSeenRef.current
      const unread = data.filter((n: NotificationItem) => 
        !lastSeen || new Date(n.createdAt) > new Date(lastSeen)
      ).length

      setUnreadCount(unread)
    } catch (error) {
      console.warn('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Poll every 10 seconds
  useEffect(() => {
    if (session?.user) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, POLL_INTERVAL)

      // Refresh when tab regains focus
      const handleVisibility = () => {
        if (!document.hidden) fetchNotifications()
      }
      document.addEventListener('visibilitychange', handleVisibility)

      return () => {
        clearInterval(interval)
        document.removeEventListener('visibilitychange', handleVisibility)
      }
    }
  }, [session]);

  // Mark all as seen when opening dropdown
  const handleOpen = () => {
    const newOpen = !isOpen
    setIsOpen(newOpen)

    if (newOpen && notifications.length > 0) {
      const now = new Date().toISOString()
      lastSeenRef.current = now
      localStorage.setItem('oog_last_seen_notification', now)
      setUnreadCount(0)
    }
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, []);

  // Format timestamp as relative time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        style={{
          position: 'relative',
          padding: '8px',
          borderRadius: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.2rem',
          color: 'white'
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              minWidth: '18px',
              height: '18px',
              background: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              fontSize: '0.6rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            width: '340px',
            maxHeight: '450px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px solid #e5e7eb',
            zIndex: 1000,
            overflow: 'hidden',
            marginTop: '8px'
          }}
        >
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', margin: 0, color: '#111827' }}>
              🔔 Notifications
            </h3>
            <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: '4px 0 0 0' }}>
              {loading ? 'Loading...' : notifications.length === 0 ? 'No notifications' : `${notifications.length} recent updates`}
            </p>
          </div>

          {/* List */}
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', fontSize: '0.75rem' }}>
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#9ca3af', fontSize: '0.75rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '10px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    background: 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <p style={{ fontSize: '0.8rem', margin: 0, fontWeight: '500', color: '#111827' }}>
                      {n.title}
                    </p>
                    <span style={{ fontSize: '0.6rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: '2px 0 0 0' }}>
                    {n.message}
                  </p>
                  <p style={{ fontSize: '0.6rem', color: '#9ca3af', margin: '4px 0 0 0' }}>
                    by {n.userName}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '10px 16px', borderTop: '1px solid #e5e7eb', background: '#f9fafb', textAlign: 'center' }}>
            <Link
              href="/dashboard/profile"
              style={{ fontSize: '0.7rem', color: '#2563eb', textDecoration: 'none' }}
              onClick={() => setIsOpen(false)}
            >
              View Activity Log →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
