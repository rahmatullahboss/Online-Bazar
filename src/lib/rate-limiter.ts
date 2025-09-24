// Rate Limiting for OTP requests
// Prevents abuse and helps manage email/SMS limits

interface RateLimit {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits: Map<string, RateLimit> = new Map()
  private readonly maxRequests: number
  private readonly windowMs: number

  constructor(maxRequests: number = 5, windowMs: number = 15 * 60 * 1000) {
    // 5 requests per 15 minutes
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const limit = this.limits.get(identifier)

    if (!limit) {
      // First request
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      })
      return true
    }

    // Check if window has expired
    if (now > limit.resetTime) {
      // Reset the limit
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      })
      return true
    }

    // Check if under limit
    if (limit.count < this.maxRequests) {
      limit.count++
      return true
    }

    return false
  }

  getTimeUntilReset(identifier: string): number {
    const limit = this.limits.get(identifier)
    if (!limit) return 0

    const now = Date.now()
    return Math.max(0, limit.resetTime - now)
  }

  getRemainingRequests(identifier: string): number {
    const limit = this.limits.get(identifier)
    if (!limit) return this.maxRequests

    const now = Date.now()
    if (now > limit.resetTime) return this.maxRequests

    return Math.max(0, this.maxRequests - limit.count)
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, limit] of this.limits.entries()) {
      if (now > limit.resetTime) {
        this.limits.delete(key)
      }
    }
  }
}

// Daily limits for email/SMS
class DailyLimiter {
  private limits: Map<string, { count: number; date: string }> = new Map()
  private readonly maxDailyRequests: number = 10 // Max 10 OTP requests per day per identifier

  isAllowed(identifier: string): boolean {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const limit = this.limits.get(identifier)

    if (!limit || limit.date !== today) {
      // First request today or new day
      this.limits.set(identifier, {
        count: 1,
        date: today,
      })
      return true
    }

    return limit.count < this.maxDailyRequests
  }

  getRemainingDailyRequests(identifier: string): number {
    const today = new Date().toISOString().split('T')[0]
    const limit = this.limits.get(identifier)

    if (!limit || limit.date !== today) {
      return this.maxDailyRequests
    }

    return Math.max(0, this.maxDailyRequests - limit.count)
  }

  increment(identifier: string): void {
    const today = new Date().toISOString().split('T')[0]
    const limit = this.limits.get(identifier)

    if (!limit || limit.date !== today) {
      this.limits.set(identifier, {
        count: 1,
        date: today,
      })
    } else {
      limit.count++
    }
  }
}

// Export instances
export const rateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 requests per 15 minutes
export const dailyLimiter = new DailyLimiter()

// Cleanup expired rate limits every 5 minutes
if (typeof window === 'undefined') {
  // Server-side only
  setInterval(
    () => {
      rateLimiter.cleanup()
    },
    5 * 60 * 1000,
  )
}

// Helper function to get client IP
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const clientIP = forwarded?.split(',')[0] || realIP || 'unknown'
  return clientIP
}

// Helper function to create rate limit identifier
export function createRateLimitKey(identifier: string, request: Request): string {
  const clientIP = getClientIP(request)
  return `${identifier}:${clientIP}`
}
