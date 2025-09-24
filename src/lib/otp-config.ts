// OTP Configuration and Toggle System
// Allows enabling/disabling OTP services and fallback management

export interface OTPConfig {
  enabled: boolean
  useSMS: boolean
  useEmail: boolean
  fallbackToDefaultEmail: boolean
  maxDailyOTPs: number
  maxHourlyOTPs: number
  cooldownMinutes: number
  autoDisableOnLimit: boolean
  autoEnableNextDay: boolean
}

// Default configuration
const defaultConfig: OTPConfig = {
  enabled: true,
  useSMS: false, // Disabled by default since no paid service
  useEmail: true, // Use dedicated email services
  fallbackToDefaultEmail: true, // Fallback to Gmail when limits hit
  maxDailyOTPs: 50, // Max 50 OTPs per day
  maxHourlyOTPs: 10, // Max 10 OTPs per hour
  cooldownMinutes: 5, // 5 minutes cooldown between requests
  autoDisableOnLimit: true, // Auto disable when daily limit reached
  autoEnableNextDay: true, // Auto enable next day
}

class OTPConfigManager {
  private config: OTPConfig = { ...defaultConfig }
  private dailyCount: Map<string, number> = new Map()
  private hourlyCount: Map<string, number> = new Map()
  private lastRequest: Map<string, number> = new Map()
  private disabledUntil: Map<string, string> = new Map() // Store disabled until date
  private lastAutoCheck: number = 0

  constructor() {
    // Load configuration from environment variables
    this.loadConfig()

    // Clean up old data every hour
    if (typeof window === 'undefined') {
      setInterval(
        () => {
          this.cleanup()
          this.checkAutoEnable()
        },
        60 * 60 * 1000,
      ) // 1 hour
    }
  }

  private loadConfig() {
    // Load from environment variables
    this.config.enabled = process.env.OTP_ENABLED !== 'false'
    this.config.useSMS = process.env.OTP_USE_SMS === 'true'
    this.config.useEmail = process.env.OTP_USE_EMAIL !== 'false'
    this.config.fallbackToDefaultEmail = process.env.OTP_FALLBACK_EMAIL !== 'false'

    if (process.env.OTP_MAX_DAILY) {
      this.config.maxDailyOTPs = parseInt(process.env.OTP_MAX_DAILY) || 50
    }
    if (process.env.OTP_MAX_HOURLY) {
      this.config.maxHourlyOTPs = parseInt(process.env.OTP_MAX_HOURLY) || 10
    }
    if (process.env.OTP_COOLDOWN_MINUTES) {
      this.config.cooldownMinutes = parseInt(process.env.OTP_COOLDOWN_MINUTES) || 5
    }
    if (process.env.OTP_AUTO_DISABLE !== undefined) {
      this.config.autoDisableOnLimit = process.env.OTP_AUTO_DISABLE === 'true'
    }
    if (process.env.OTP_AUTO_ENABLE !== undefined) {
      this.config.autoEnableNextDay = process.env.OTP_AUTO_ENABLE === 'true'
    }
  }

  // Check if OTP service is available
  isOTPAvailable(identifier: string): { available: boolean; reason?: string; fallback?: boolean } {
    if (!this.config.enabled) {
      return {
        available: false,
        reason: 'OTP service is disabled',
        fallback: this.config.fallbackToDefaultEmail,
      }
    }

    const now = Date.now()
    const today = new Date().toISOString().split('T')[0]
    const hour = new Date().toISOString().split('T')[1].split(':')[0]

    // Check daily limit
    const dailyKey = `${identifier}:${today}`
    const dailyCount = this.dailyCount.get(dailyKey) || 0
    if (dailyCount >= this.config.maxDailyOTPs) {
      // Auto disable if enabled
      if (this.config.autoDisableOnLimit) {
        this.autoDisableService(identifier, today)
      }

      return {
        available: false,
        reason: `Daily OTP limit reached (${this.config.maxDailyOTPs})`,
        fallback: this.config.fallbackToDefaultEmail,
      }
    }

    // Check hourly limit
    const hourlyKey = `${identifier}:${today}:${hour}`
    const hourlyCount = this.hourlyCount.get(hourlyKey) || 0
    if (hourlyCount >= this.config.maxHourlyOTPs) {
      return {
        available: false,
        reason: `Hourly OTP limit reached (${this.config.maxHourlyOTPs})`,
        fallback: this.config.fallbackToDefaultEmail,
      }
    }

    // Check cooldown
    const lastRequestTime = this.lastRequest.get(identifier) || 0
    const cooldownMs = this.config.cooldownMinutes * 60 * 1000
    if (now - lastRequestTime < cooldownMs) {
      const remainingMinutes = Math.ceil((cooldownMs - (now - lastRequestTime)) / (60 * 1000))
      return {
        available: false,
        reason: `Please wait ${remainingMinutes} minutes before requesting another OTP`,
        fallback: this.config.fallbackToDefaultEmail,
      }
    }

    return { available: true }
  }

  // Record OTP request
  recordOTPRequest(identifier: string) {
    const now = Date.now()
    const today = new Date().toISOString().split('T')[0]
    const hour = new Date().toISOString().split('T')[1].split(':')[0]

    // Update daily count
    const dailyKey = `${identifier}:${today}`
    this.dailyCount.set(dailyKey, (this.dailyCount.get(dailyKey) || 0) + 1)

    // Update hourly count
    const hourlyKey = `${identifier}:${today}:${hour}`
    this.hourlyCount.set(hourlyKey, (this.hourlyCount.get(hourlyKey) || 0) + 1)

    // Update last request time
    this.lastRequest.set(identifier, now)
  }

  // Get remaining OTPs
  getRemainingOTPs(identifier: string): { daily: number; hourly: number; cooldownMinutes: number } {
    const now = Date.now()
    const today = new Date().toISOString().split('T')[0]
    const hour = new Date().toISOString().split('T')[1].split(':')[0]

    const dailyKey = `${identifier}:${today}`
    const hourlyKey = `${identifier}:${today}:${hour}`

    const dailyCount = this.dailyCount.get(dailyKey) || 0
    const hourlyCount = this.hourlyCount.get(hourlyKey) || 0

    const lastRequestTime = this.lastRequest.get(identifier) || 0
    const cooldownMs = this.config.cooldownMinutes * 60 * 1000
    const cooldownMinutes = Math.max(
      0,
      Math.ceil((cooldownMs - (now - lastRequestTime)) / (60 * 1000)),
    )

    return {
      daily: Math.max(0, this.config.maxDailyOTPs - dailyCount),
      hourly: Math.max(0, this.config.maxHourlyOTPs - hourlyCount),
      cooldownMinutes,
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<OTPConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  // Get current configuration
  getConfig(): OTPConfig {
    return { ...this.config }
  }

  // Toggle OTP service
  toggleOTP(enabled: boolean) {
    this.config.enabled = enabled
  }

  // Toggle SMS service
  toggleSMS(enabled: boolean) {
    this.config.useSMS = enabled
  }

  // Toggle Email service
  toggleEmail(enabled: boolean) {
    this.config.useEmail = enabled
  }

  // Toggle fallback to default email
  toggleFallback(enabled: boolean) {
    this.config.fallbackToDefaultEmail = enabled
  }

  // Clean up old data
  private cleanup() {
    const now = Date.now()
    const today = new Date().toISOString().split('T')[0]
    const hour = new Date().toISOString().split('T')[1].split(':')[0]

    // Clean up old daily counts (older than 2 days)
    for (const [key, count] of this.dailyCount.entries()) {
      const keyDate = key.split(':')[1]
      if (keyDate < today) {
        this.dailyCount.delete(key)
      }
    }

    // Clean up old hourly counts (older than 2 hours)
    for (const [key, count] of this.hourlyCount.entries()) {
      const keyParts = key.split(':')
      const keyDate = keyParts[1]
      const keyHour = keyParts[2]
      if (keyDate < today || (keyDate === today && keyHour < hour)) {
        this.hourlyCount.delete(key)
      }
    }

    // Clean up old last request times (older than 1 hour)
    for (const [key, timestamp] of this.lastRequest.entries()) {
      if (now - timestamp > 60 * 60 * 1000) {
        this.lastRequest.delete(key)
      }
    }
  }

  // Reset limits for a specific identifier (admin function)
  resetLimits(identifier: string) {
    const today = new Date().toISOString().split('T')[0]
    const hour = new Date().toISOString().split('T')[1].split(':')[0]

    this.dailyCount.delete(`${identifier}:${today}`)
    this.hourlyCount.delete(`${identifier}:${today}:${hour}`)
    this.lastRequest.delete(identifier)
  }

  // Get usage statistics
  getUsageStats(identifier: string) {
    const now = Date.now()
    const today = new Date().toISOString().split('T')[0]
    const hour = new Date().toISOString().split('T')[1].split(':')[0]

    const dailyKey = `${identifier}:${today}`
    const hourlyKey = `${identifier}:${today}:${hour}`

    return {
      dailyUsed: this.dailyCount.get(dailyKey) || 0,
      hourlyUsed: this.hourlyCount.get(hourlyKey) || 0,
      lastRequest: this.lastRequest.get(identifier) || 0,
      remaining: this.getRemainingOTPs(identifier),
    }
  }

  // Auto disable service when limit reached
  private autoDisableService(identifier: string, today: string) {
    if (!this.config.autoDisableOnLimit) return

    // Disable until next day
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    this.disabledUntil.set(identifier, tomorrowStr)
    this.config.enabled = false

    console.log(`OTP service auto-disabled for ${identifier} until ${tomorrowStr}`)
  }

  // Check if service should be auto-enabled
  private checkAutoEnable() {
    if (!this.config.autoEnableNextDay) return

    const now = Date.now()
    // Only check once per hour to avoid excessive processing
    if (now - this.lastAutoCheck < 60 * 60 * 1000) return

    this.lastAutoCheck = now
    const today = new Date().toISOString().split('T')[0]

    // Check all disabled services
    for (const [identifier, disabledUntil] of this.disabledUntil.entries()) {
      if (disabledUntil <= today) {
        // Re-enable service
        this.disabledUntil.delete(identifier)
        this.config.enabled = true

        console.log(`OTP service auto-enabled for ${identifier}`)
      }
    }
  }

  // Check if service is disabled for specific identifier
  isServiceDisabled(identifier: string): { disabled: boolean; until?: string } {
    const disabledUntil = this.disabledUntil.get(identifier)
    if (!disabledUntil) return { disabled: false }

    const today = new Date().toISOString().split('T')[0]
    if (disabledUntil <= today) {
      // Auto enable if date has passed
      this.disabledUntil.delete(identifier)
      return { disabled: false }
    }

    return { disabled: true, until: disabledUntil }
  }

  // Manual enable service (admin function)
  manualEnableService() {
    this.config.enabled = true
    this.disabledUntil.clear()
    console.log('OTP service manually enabled')
  }

  // Manual disable service (admin function)
  manualDisableService() {
    this.config.enabled = false
    console.log('OTP service manually disabled')
  }
}

// Export singleton instance
export const otpConfig = new OTPConfigManager()

// Helper function to check if we should use default email
export function shouldUseDefaultEmail(identifier: string): boolean {
  const availability = otpConfig.isOTPAvailable(identifier)
  const serviceStatus = otpConfig.isServiceDisabled(identifier)

  // Always use fallback if service is disabled or unavailable
  return (!availability.available && availability.fallback) || serviceStatus.disabled
}

// Helper function to get service status
export function getServiceStatus() {
  const config = otpConfig.getConfig()
  return {
    otpEnabled: config.enabled,
    smsEnabled: config.useSMS,
    emailEnabled: config.useEmail,
    fallbackEnabled: config.fallbackToDefaultEmail,
    limits: {
      daily: config.maxDailyOTPs,
      hourly: config.maxHourlyOTPs,
      cooldown: config.cooldownMinutes,
    },
  }
}
