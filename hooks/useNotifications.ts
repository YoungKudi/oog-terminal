import { useState, useEffect, useCallback } from 'react'
import { pushService } from '@/lib/notifications/push'

export interface Notification {
  id: string
  type: 'container' | 'devanning' | 'loadout' | 'evacuation' | 'unstuffed' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
  data?: any
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isPushEnabled, setIsPushEnabled] = useState(false)
  const [hasAsked, setHasAsked] = useState(false)

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('oog_notifications')
      if (saved) {
        const parsed = JSON.parse(saved)
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })))
        const unread = parsed.filter((n: any) => !n.read).length
        setUnreadCount(unread)
      }
      
      // Check if we've asked before
      const asked = localStorage.getItem('oog_notification_asked')
      setHasAsked(asked === 'true')
      
      // Check permission
      if ('Notification' in window) {
        setPermission(Notification.permission)
        setIsPushEnabled(Notification.permission === 'granted')
      }
    } catch (e) {
      console.error('Error loading notifications:', e)
    }
  }, [])

  // Save notifications to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('oog_notifications', JSON.stringify(notifications))
    } catch (e) {
      console.error('Error saving notifications:', e)
    }
  }, [notifications])

  // Request permission (only if not asked before)
  const requestPermission = useCallback(async () => {
    if (hasAsked) {
      // If already asked, just return current permission
      return Notification.permission === 'granted'
    }
    
    const granted = await pushService.requestPermission()
    setPermission(granted ? 'granted' : 'denied')
    setIsPushEnabled(granted)
    
    // Mark as asked
    setHasAsked(true)
    localStorage.setItem('oog_notification_asked', 'true')
    
    return granted
  }, [hasAsked])

  // ... rest of the hook
  const addNotification = useCallback((
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>,
    sendPush: boolean = true
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    }

    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)

    if (sendPush && isPushEnabled && 'Notification' in window) {
      try {
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo.png',
            vibrate: [200, 100, 200],
          })
        }
      } catch (error) {
        console.error('Push notification error:', error)
      }
    }

    return newNotification
  }, [isPushEnabled])

  // ... rest of the hook
  return {
    notifications,
    unreadCount,
    permission,
    isPushEnabled,
    hasAsked,
    requestPermission,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    setNotifications,
  }
}
