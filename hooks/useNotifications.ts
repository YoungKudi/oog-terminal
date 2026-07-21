import { useState, useEffect, useCallback } from 'react'

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
  const [hasBeenAsked, setHasBeenAsked] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      // Load notifications
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

      // Load notification preference
      const asked = localStorage.getItem('oog_notification_asked')
      if (asked === 'true') {
        setHasBeenAsked(true)
      }

      const enabled = localStorage.getItem('oog_notification_enabled')
      if (enabled === 'true') {
        setIsPushEnabled(true)
        setPermission('granted')
      }
    } catch (e) {
      console.error('Error loading notifications:', e)
    }
  }, [])

  // Request permission (only once)
  const requestPermission = useCallback(async () => {
    if (hasBeenAsked) {
      // Return stored preference
      return isPushEnabled
    }

    if (!('Notification' in window)) {
      setHasBeenAsked(true)
      localStorage.setItem('oog_notification_asked', 'true')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      const granted = result === 'granted'
      
      setPermission(granted ? 'granted' : 'denied')
      setIsPushEnabled(granted)
      setHasBeenAsked(true)
      
      localStorage.setItem('oog_notification_asked', 'true')
      localStorage.setItem('oog_notification_enabled', String(granted))
      
      return granted
    } catch (error) {
      console.error('Notification permission error:', error)
      setHasBeenAsked(true)
      localStorage.setItem('oog_notification_asked', 'true')
      return false
    }
  }, [hasBeenAsked, isPushEnabled])

  // Toggle notifications on/off
  const toggleNotifications = useCallback(() => {
    const newState = !isPushEnabled
    setIsPushEnabled(newState)
    localStorage.setItem('oog_notification_enabled', String(newState))
    if (newState && Notification.permission !== 'granted') {
      requestPermission()
    }
    return newState
  }, [isPushEnabled, requestPermission])

  // Add notification with push
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

    // Send push notification if enabled
    if (sendPush && isPushEnabled && Notification.permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
          vibrate: [200, 100, 200],
        })
      } catch (error) {
        console.error('Push notification error:', error)
      }
    }

    return newNotification
  }, [isPushEnabled])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n)
      const unread = updated.filter(n => !n.read).length
      setUnreadCount(unread)
      return updated
    })
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      setUnreadCount(0)
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return {
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
    setNotifications,
  }
}
