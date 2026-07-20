"use client"
import React, { useState, useEffect } from 'react'
import { useRealtime } from '@/hooks/useRealtime'

interface Notification {
  id: string
  type: 'container' | 'devanning' | 'loadout' | 'evacuation' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
  data?: any
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Listen to realtime events
  useRealtime('Container', (event) => {
    if (event.action === 'INSERT') {
      addNotification({
        type: 'container',
        title: '📦 New Container Added',
        message: `Container ${event.new.containerNumber} added at ${event.new.position}`,
        data: event.new,
      })
    } else if (event.action === 'UPDATE') {
      addNotification({
        type: 'container',
        title: '🔄 Container Updated',
        message: `Container ${event.new.containerNumber} was updated`,
        data: event.new,
      })
    } else if (event.action === 'DELETE') {
      addNotification({
        type: 'container',
        title: '🗑️ Container Removed',
        message: `Container ${event.old.containerNumber} was removed`,
        data: event.old,
      })
    }
  })

  useRealtime('DevanningQueue', (event) => {
    if (event.action === 'INSERT') {
      addNotification({
        type: 'devanning',
        title: '🏗️ Container in Devanning',
        message: `Container ${event.new.containerNumber} moved to devanning`,
        data: event.new,
      })
    } else if (event.action === 'UPDATE') {
      addNotification({
        type: 'devanning',
        title: '🔄 Devanning Updated',
        message: `Container ${event.new.containerNumber}: ${event.new.devanningStatus}`,
        data: event.new,
      })
    }
  })

  useRealtime('LoadoutRecord', (event) => {
    if (event.action === 'INSERT') {
      addNotification({
        type: 'loadout',
        title: '✅ Container Cleared',
        message: `Container ${event.new.containerNumber} cleared with truck ${event.new.truckPlate}`,
        data: event.new,
      })
    }
  })

  useRealtime('EvacuationRecord', (event) => {
    if (event.action === 'INSERT') {
      addNotification({
        type: 'evacuation',
        title: '🚚 Container Evacuated',
        message: `Container ${event.new.containerNumber} evacuated`,
        data: event.new,
      })
    }
  })

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    }
    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const clearAll = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255,255,255,0.15)',
          border: 'none',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          color: 'white',
          fontSize: '1.2rem'
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#dc2626',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '0.6rem',
              fontWeight: 'bold',
              minWidth: '18px',
              textAlign: 'center'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '45px',
            right: '0',
            width: '380px',
            maxHeight: '400px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            zIndex: 1000,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc'
            }}
          >
            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>📢 Notifications</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.65rem',
                      color: '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={clearAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.65rem',
                      color: '#dc2626',
                      cursor: 'pointer'
                    }}
                  >
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.85rem'
                }}
              >
                🔕 No notifications
              </div>
            ) : (
              notifications.slice(0, 50).map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    background: notification.read ? 'transparent' : '#f0fdf4',
                    transition: 'background 0.2s',
                    ':hover': {
                      background: '#f1f5f9',
                    },
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                    {notification.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#475569' }}>
                    {notification.message}
                  </div>
                  <div style={{ fontSize: '0.55rem', color: '#94a3b8', marginTop: '4px' }}>
                    {notification.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
