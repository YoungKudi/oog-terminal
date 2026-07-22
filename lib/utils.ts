// Color helper for dark mode
export function getColor(isDark: boolean, lightColor: string, darkColor: string): string {
  return isDark ? darkColor : lightColor
}

// Parse cargo number from container number
export function parseCargoNumber(containerNumber: string): string {
  if (!containerNumber) return ''
  // Extract numbers from container number
  const matches = containerNumber.match(/\d+/)
  return matches ? matches[0] : ''
}

// Validate container number format
export function validateContainerNumber(containerNumber: string): boolean {
  if (!containerNumber) return false
  // Standard container number format: 4 letters + 7 numbers
  const pattern = /^[A-Z]{4}\d{7}$/
  return pattern.test(containerNumber.toUpperCase())
}

// Format date for display
export function formatDate(date: string | Date): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format time for display
export function formatTime(date: string | Date): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get status color
export function getStatusColor(status: string, isDark: boolean = false): string {
  const colors: Record<string, string> = {
    'pending': isDark ? '#f59e0b' : '#d97706',
    'in_progress': isDark ? '#3b82f6' : '#2563eb',
    'completed': isDark ? '#10b981' : '#059669',
    'failed': isDark ? '#ef4444' : '#dc2626',
    'cancelled': isDark ? '#6b7280' : '#4b5563',
    'in_stack': isDark ? '#8b5cf6' : '#7c3aed',
    'breaking': isDark ? '#f59e0b' : '#d97706',
    'positioned': isDark ? '#3b82f6' : '#2563eb',
    'unlashing': isDark ? '#8b5cf6' : '#7c3aed',
    'ready_to_drop': isDark ? '#10b981' : '#059669',
    'unstuffed': isDark ? '#06b6d4' : '#0891b2',
    'cleared': isDark ? '#10b981' : '#059669',
    'evacuated': isDark ? '#ef4444' : '#dc2626',
  }
  return colors[status?.toLowerCase()] || (isDark ? '#94a3b8' : '#6b7280')
}

// Truncate text
export function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

// Check if object is empty
export function isEmpty(obj: any): boolean {
  if (!obj) return true
  return Object.keys(obj).length === 0
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

// Get initials from name
export function getInitials(name: string): string {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}
