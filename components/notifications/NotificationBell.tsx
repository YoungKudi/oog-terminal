"use client"
import React, { useState, useEffect } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { useRealtime } from '@/hooks/useRealtime'
import { getColor } from '@/lib/utils'

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    permission,
    isPushEnabled,
    requestPermission,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    setNotifications,
  } = useNotifications()

  const [isOpen, setIsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const dark = localStorage.getItem('oog_dark_mode') === 'true'
    setIsDarkMode(dark)
  }, [])

  // Listen to realtime events for all tables
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

  useRealtime('UnstuffedContainer', (event) => {
    if (event.action === 'INSERT') {
      addNotification({
        type: 'unstuffed',
        title: '✅ Container Unstuffed',
        message: `Container ${event.new.containerNumber} has been unstuffed`,
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

  const bgColor = getColor(isDarkMode, 'white', '#1e293b')
  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const borderColor = getColor(isDarkMode, '#e2e8f0', '#334155')
  const hoverBg = getColor(isDarkMode, '#f1f5f9', '#2d3a5e')

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

      {/* Push Notification Permission Banner */}
      {permission !== 'granted' && (
        <div
          style={{
            position: 'absolute',
            top: '45px',
            right: '0',
            width: '280px',
            background: getColor(isDarkMode, '#fef3c7', '#1e293b'),
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '0.65rem',
            border: `1px solid ${getColor(isDarkMode, '#f59e0b', '#8b5cf6')}`,
            zIndex: 1001,
          }}
        >
          <div style={{ color: getColor(isDarkMode, '#78350f', '#fbbf24') }}>
            🔔 Enable notifications for real-time updates
          </div>
          <button
            onClick={() => requestPermission()}
            style={{
              background: '#1e6f3f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 12px',
              fontSize: '0.6rem',
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            Enable Notifications
          </button>
        </div>
      )}

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '45px',
            right: '0',
            width: '380px',
            maxHeight: '400px',
            background: bgColor,
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            zIndex: 1000,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: `1px solid ${borderColor}`,
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${borderColor}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: getColor(isDarkMode, '#f8fafc', '#0f172a')
            }}
          >
            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: textColor }}>
              📢 Notifications
              {isPushEnabled && (
                <span style={{ fontSize: '0.55rem', color: '#10b981', marginLeft: '8px' }}>
                  ● Live
                </span>
              )}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.65rem',
                      color: getColor(isDarkMode, '#64748b', '#94a3b8'),
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
                  color: getColor(isDarkMode, '#94a3b8', '#64748b'),
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
                    borderBottom: `1px solid ${borderColor}`,
                    cursor: 'pointer',
                    background: notification.read ? 'transparent' : getColor(isDarkMode, '#f0fdf4', '#0f172a'),
                    transition: 'background 0.2s',
                    color: textColor,
                    ':hover': {
                      background: hoverBg,
                    },
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                    {notification.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: getColor(isDarkMode, '#475569', '#94a3b8') }}>
                    {notification.message}
                  </div>
                  <div style={{ fontSize: '0.55rem', color: getColor(isDarkMode, '#94a3b8', '#64748b'), marginTop: '4px' }}>
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
