interface RateLimitStore {
  [ip: string]: {
    count: number
    resetTime: number
    blockedUntil: number
  }
}

const store: RateLimitStore = {}
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000')
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || '100')
const PUBLIC_MAX_REQUESTS = parseInt(process.env.PUBLIC_RATE_LIMIT_MAX || '30')
const BLOCK_DURATION = 15 * 60 * 1000 // 15 minutes

export function rateLimit(ip: string, isPublic: boolean = true): { 
  limited: boolean; 
  remaining: number; 
  blocked: boolean;
  blockRemaining?: number;
} {
  const now = Date.now()
  const maxRequests = isPublic ? PUBLIC_MAX_REQUESTS : MAX_REQUESTS
  
  // Check if IP is blocked
  if (store[ip] && store[ip].blockedUntil > now) {
    const blockRemaining = Math.ceil((store[ip].blockedUntil - now) / 1000)
    return { limited: true, remaining: 0, blocked: true, blockRemaining }
  }
  
  // Reset if window expired
  if (!store[ip] || store[ip].resetTime < now) {
    store[ip] = { count: 1, resetTime: now + WINDOW_MS, blockedUntil: 0 }
    return { limited: false, remaining: maxRequests - 1, blocked: false }
  }
  
  store[ip].count++
  const remaining = Math.max(0, maxRequests - store[ip].count)
  
  // Block IP if exceeding limit
  if (store[ip].count > maxRequests) {
    store[ip].blockedUntil = now + BLOCK_DURATION
    return { 
      limited: true, 
      remaining: 0, 
      blocked: true,
      blockRemaining: Math.ceil(BLOCK_DURATION / 1000)
    }
  }
  
  return { limited: false, remaining, blocked: false }
}
