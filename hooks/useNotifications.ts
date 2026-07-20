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

  // Check notification permission
  useEffect(() => {
    if (!('Notification' in window)) return
    setPermission(Notification.permission)
    setIsPushEnabled(Notification.permission === 'granted')
  }, [])

  // Request permission
  const requestPermission = useCallback(async () => {
    const granted = await pushService.requestPermission()
    setPermission(granted ? 'granted' : 'denied')
    setIsPushEnabled(granted)
    return granted
  }, [])

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
    if (sendPush && isPushEnabled && 'Notification' in window) {
      try {
        // Send notification
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
    requestPermission,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    setNotifications,
  }
}
