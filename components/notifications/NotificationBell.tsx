"use client"
import React, { useState, useEffect, useRef } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { useRealtime } from '@/hooks/useRealtime'
import { getColor } from '@/lib/utils'

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    permission,
    isPushEnabled,
    hasBeenAsked,
    requestPermission,
    toggleNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications()

  const [isOpen, setIsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const dark = localStorage.getItem('oog_dark_mode') === 'true'
    setIsDarkMode(dark)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Realtime listeners with user info
  useRealtime('Container', (event) => {
    if (event.action === 'INSERT') {
      addNotification({
        type: 'container',
        title: '📦 New Container Added',
        message: `${event.new.containerNumber} added at ${event.new.position}`,
        data: event.new,
        user: event.user,
      })
    } else if (event.action === 'DELETE') {
      addNotification({
        type: 'container',
        title: '🗑️ Container Removed',
        message: `${event.old.containerNumber} was removed from stack`,
        data: event.old,
        user: event.user,
      })
    }
  })

  useRealtime('DevanningQueue', (event) => {
    if (event.action === 'INSERT') {
      addNotification({
        type: 'devanning',
        title: '🏗️ In Devanning',
        message: `${event.new.containerNumber} moved to devanning`,
        data: event.new,
        user: event.user,
      })
    } else if (event.action === 'UPDATE' && event.old?.devanningStatus !== event.new?.devanningStatus) {
      addNotification({
        type: 'devanning',
        title: '🔄 Status Updated',
        message: `${event.new.containerNumber}: ${event.new.devanningStatus}`,
        data: event.new,
        user: event.user,
      })
    }
  })

  useRealtime('UnstuffedContainer', (event) => {
    if (event.action === 'INSERT') {
      addNotification({
        type: 'unstuffed',
        title: '✅ Container Unstuffed',
        message: `${event.new.containerNumber} has been unstuffed`,
        data: event.new,
        user: event.user,
      })
    }
  })

  useRealtime('LoadoutRecord', (event) => {
    if (event.action === 'INSERT') {
      addNotification({
        type: 'loadout',
        title: '✅ Container Cleared',
        message: `${event.new.containerNumber} cleared with truck ${event.new.truckPlate}`,
        data: event.new,
        user: event.user,
      })
    }
  })

  useRealtime('EvacuationRecord', (event) => {
    if (event.action === 'INSERT') {
      addNotification({
        type: 'evacuation',
        title: '🚚 Container Evacuated',
        message: `${event.new.containerNumber} evacuated`,
        data: event.new,
        user: event.user,
      })
    }
  })

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const bgColor = getColor(isDarkMode, 'white', '#1e293b')
  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const borderColor = getColor(isDarkMode, '#e2e8f0', '#334155')
  const hoverBg = getColor(isDarkMode, '#f1f5f9', '#2d3a5e')

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
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
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: '60px',
            right: '16px',
            width: window.innerWidth < 480 ? 'calc(100vw - 32px)' : '380px',
            maxWidth: '380px',
            maxHeight: window.innerHeight < 600 ? 'calc(100vh - 100px)' : '400px',
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
              flexWrap: 'wrap',
              gap: '4px',
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
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              <button
                onClick={toggleNotifications}
                style={{
                  background: isPushEnabled ? '#10b981' : '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.55rem',
                  cursor: 'pointer'
                }}
              >
                {isPushEnabled ? '🔔 On' : '🔕 Off'}
              </button>
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.6rem',
                      color: getColor(isDarkMode, '#64748b', '#94a3b8'),
                      cursor: 'pointer',
                      padding: '2px 6px'
                    }}
                  >
                    ✓ All
                  </button>
                  <button
                    onClick={clearAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.6rem',
                      color: '#dc2626',
                      cursor: 'pointer',
                      padding: '2px 6px'
                    }}
                  >
                    ✕ Clear
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
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = hoverBg
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notification.read ? 'transparent' : getColor(isDarkMode, '#f0fdf4', '#0f172a')
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                      {notification.title}
                    </div>
                    {notification.user && (
                      <span style={{ 
                        fontSize: '0.55rem', 
                        color: getColor(isDarkMode, '#64748b', '#94a3b8'),
                        background: getColor(isDarkMode, '#f1f5f9', '#1e293b'),
                        padding: '1px 8px',
                        borderRadius: '12px',
                        marginLeft: '4px',
                        flexShrink: 0
                      }}>
                        👤 {notification.user.name || notification.user.userId}
                      </span>
                    )}
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
