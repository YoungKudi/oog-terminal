// Push notification service using Web Push API
export const pushService = {
  // Check if browser supports notifications
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator
  },

  // Request permission
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  },

  // Send a notification
  async sendNotification(title: string, body: string, icon?: string) {
    if (!this.isSupported()) return
    
    const permission = await Notification.permission
    if (permission !== 'granted') return
    
    try {
      const registration = await navigator.serviceWorker?.getRegistration()
      if (registration) {
        registration.showNotification(title, {
          body,
          icon: icon || '/logo.png',
          badge: '/badge.png',
          vibrate: [200, 100, 200],
          data: {
            date: Date.now(),
          },
          actions: [
            { action: 'view', title: 'View' },
            { action: 'dismiss', title: 'Dismiss' },
          ],
        })
      }
    } catch (error) {
      console.error('Push notification error:', error)
    }
  },

  // Send notification using the browser API (fallback)
  sendFallbackNotification(title: string, body: string) {
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return
    
    try {
      new Notification(title, {
        body,
        icon: '/logo.png',
        vibrate: [200, 100, 200],
      })
    } catch (error) {
      console.error('Fallback notification error:', error)
    }
  }
}
