// Simple in-memory rate limiter for public API
interface RateLimitStore {
  [ip: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}
const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 30 // 30 requests per minute

export function rateLimit(ip: string): { limited: boolean; remaining: number } {
  const now = Date.now()
  
  if (!store[ip] || store[ip].resetTime < now) {
    store[ip] = { count: 1, resetTime: now + WINDOW_MS }
    return { limited: false, remaining: MAX_REQUESTS - 1 }
  }
  
  store[ip].count++
  const remaining = Math.max(0, MAX_REQUESTS - store[ip].count)
  
  if (store[ip].count > MAX_REQUESTS) {
    return { limited: true, remaining: 0 }
  }
  
  return { limited: false, remaining }
}
