// ============================================
// COLOR HELPERS
// ============================================

export function getColor(isDark: boolean, lightColor: string, darkColor: string): string {
  return isDark ? darkColor : lightColor
}

// ============================================
// CONTAINER NUMBER HELPERS
// ============================================

export function parseCargoNumber(containerNumber: string): string {
  if (!containerNumber) return ''
  const matches = containerNumber.match(/\d+/)
  return matches ? matches[0] : ''
}

export function validateContainerNumber(containerNumber: string): boolean {
  if (!containerNumber) return false
  const pattern = /^[A-Z]{4}\d{7}$/
  return pattern.test(containerNumber.toUpperCase())
}

// ============================================
// TAB COUNTS - THIS WAS MISSING!
// ============================================

export function getTabCounts(
  containers: any[] = [],
  importQueue: any[] = [],
  devanningQueue: any[] = [],
  unstuffedContainers: any[] = [],
  evacuationRecords: any[] = []
) {
  return {
    queue: importQueue?.length || 0,
    receivals: containers?.filter((c: any) => c.status === 'receivals' || !c.status).length || 0,
    tallies: containers?.filter((c: any) => c.status === 'tallies' || c.position).length || 0,
    devanning: devanningQueue?.length || 0,
    unstuffed: unstuffedContainers?.length || 0,
    evacuation: evacuationRecords?.length || 0,
  }
}

// ============================================
// DATE & TIME HELPERS
// ============================================

export function formatDate(date: string | Date): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatTime(date: string | Date): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function timeAgo(date: string | Date): string {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// ============================================
// STATUS COLORS
// ============================================

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

// ============================================
// TEXT HELPERS
// ============================================

export function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

export function getInitials(name: string): string {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// ============================================
// OBJECT HELPERS
// ============================================

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function isEmpty(obj: any): boolean {
  if (!obj) return true
  return Object.keys(obj).length === 0
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// ============================================
// PERFORMANCE HELPERS
// ============================================

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

// ============================================
// FORMAT HELPERS
// ============================================

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}
