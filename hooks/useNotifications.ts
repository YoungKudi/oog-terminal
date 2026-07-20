import { useState, useEffect, useCallback } from 'react'
import { pushService } from '@/lib/notifications/push'
import { supabase } from '@/lib/db'

interface Notification {
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
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    }

    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)

    // Send push notification if enabled
    if (sendPush && isPushEnabled) {
      pushService.sendNotification(
        notification.title,
        notification.message
      )
    }

    return newNotification
  }, [isPushEnabled])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
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
