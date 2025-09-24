import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { smsService } from '@/lib/sms-service'
import { emailService } from '@/lib/email-service'
import { rateLimiter, dailyLimiter, createRateLimitKey } from '@/lib/rate-limiter'
import { otpConfig, shouldUseDefaultEmail } from '@/lib/otp-config'

// Generate a 6-digit OTP code
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const body = await request.json()
    const { email, phone, type = 'registration' } = body

    // Validate input
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Either email or phone number is required' },
        { status: 400 },
      )
    }

    // Validate email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 })
    }

    // Validate phone format (Bangladeshi)
    if (phone && !/^01[3-9]\d{8}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Please provide a valid Bangladeshi phone number (01XXXXXXXXX)' },
        { status: 400 },
      )
    }

    // Check OTP service availability
    const identifier = email || phone || 'unknown'
    const otpAvailability = otpConfig.isOTPAvailable(identifier)

    // Check if service is auto-disabled
    const serviceStatus = otpConfig.isServiceDisabled(identifier)
    if (serviceStatus.disabled) {
      // If auto-disabled, use default email service instead of showing error
      console.log(`OTP service disabled, using default email service for ${identifier}`)
      // Continue with default email service (existing Gmail setup)
    }

    if (!otpAvailability.available) {
      // If fallback is enabled, use default email service
      if (otpAvailability.fallback && email) {
        console.log('OTP service unavailable, falling back to default email service')
        // Continue with default email service (existing Gmail setup)
      } else {
        const remaining = otpConfig.getRemainingOTPs(identifier)
        return NextResponse.json(
          {
            error: otpAvailability.reason || 'OTP service is currently unavailable',
            remainingDailyRequests: remaining.daily,
            remainingHourlyRequests: remaining.hourly,
            cooldownMinutes: remaining.cooldownMinutes,
            fallbackAvailable: otpAvailability.fallback,
          },
          { status: 429 },
        )
      }
    }

    // Rate limiting (legacy - keeping for backward compatibility)
    const rateLimitKey = createRateLimitKey(identifier, request)

    // Check daily limit
    if (!dailyLimiter.isAllowed(rateLimitKey)) {
      const remaining = dailyLimiter.getRemainingDailyRequests(rateLimitKey)
      return NextResponse.json(
        {
          error: `Daily OTP limit reached. You can request ${remaining} more OTP(s) tomorrow.`,
          remainingDailyRequests: remaining,
        },
        { status: 429 },
      )
    }

    // Check rate limit
    if (!rateLimiter.isAllowed(rateLimitKey)) {
      const timeUntilReset = Math.ceil(rateLimiter.getTimeUntilReset(rateLimitKey) / 1000 / 60) // minutes
      const remaining = rateLimiter.getRemainingRequests(rateLimitKey)
      return NextResponse.json(
        {
          error: `Too many OTP requests. Please wait ${timeUntilReset} minutes before trying again.`,
          timeUntilReset: timeUntilReset,
          remainingRequests: remaining,
        },
        { status: 429 },
      )
    }

    // Check if user already exists for registration
    if (type === 'registration' && email) {
      const existingUsers = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: email,
          },
        },
        limit: 1,
      })

      if (existingUsers.docs.length > 0) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 },
        )
      }
    }

    // Clean up expired OTPs for this email/phone
    await payload.delete({
      collection: 'otps',
      where: {
        and: [
          {
            or: [
              ...(email ? [{ email: { equals: email } }] : []),
              ...(phone ? [{ phone: { equals: phone } }] : []),
            ],
          },
          {
            or: [
              { expiresAt: { less_than: new Date().toISOString() } },
              { isVerified: { equals: true } },
            ],
          },
        ],
      },
    })

    // Generate new OTP
    const otpCode = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store OTP in database
    const otpRecord = await payload.create({
      collection: 'otps',
      data: {
        email: email || undefined,
        phone: phone || undefined,
        code: otpCode,
        type,
        isVerified: false,
        attempts: 0,
        expiresAt: expiresAt.toISOString(),
        metadata: {
          ip:
            request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          timestamp: new Date().toISOString(),
        },
      },
    })

    // Send OTP via email or SMS
    let sentSuccessfully = false
    let sentVia = ''
    let usedFallback = false

    // Check if we should use fallback (default email service)
    const shouldUseFallback = shouldUseDefaultEmail(identifier) || serviceStatus.disabled

    if (shouldUseFallback && email) {
      console.log('Using fallback default email service...')
      usedFallback = true
      sentVia = 'email (fallback)'

      // Use existing Gmail service from payload config
      try {
        await payload.sendEmail({
          to: email,
          subject: 'Your OTP Code - Online Bazar',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>OTP Verification</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #F97316 0%, #F43F5E 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Online Bazar</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your OTP Verification Code</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                <h2 style="color: #333; margin-bottom: 20px;">Your Verification Code</h2>
                <div style="background: white; padding: 20px; border-radius: 8px; border: 2px dashed #F97316; display: inline-block; margin: 20px 0;">
                  <span style="font-size: 32px; font-weight: bold; color: #F97316; letter-spacing: 5px;">${otpCode}</span>
                </div>
                <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">
                  This code will expire in <strong>10 minutes</strong>
                </p>
              </div>
              
              <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <h3 style="color: #856404; margin-top: 0;">Important Security Information</h3>
                <ul style="color: #856404; margin: 0; padding-left: 20px;">
                  <li>Never share this code with anyone</li>
                  <li>Our team will never ask for your OTP code</li>
                  <li>If you didn't request this code, please ignore this email</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">
                  This is an automated message from Online Bazar. Please do not reply to this email.
                </p>
              </div>
            </body>
            </html>
          `,
        })
        sentSuccessfully = true
      } catch (error) {
        console.error('Fallback email failed:', error)
        sentSuccessfully = false
      }
    } else {
      // Use configured OTP services
      if (email) {
        console.log('Attempting to send OTP via email...')
        sentSuccessfully = await emailService.sendOTP(email, otpCode, type)
        sentVia = 'email'
      } else if (phone) {
        console.log('Attempting to send OTP via SMS...')
        sentSuccessfully = await smsService.sendOTP(phone, otpCode, type)
        sentVia = 'SMS'
      }
    }

    if (!sentSuccessfully) {
      // If sending fails, delete the OTP record
      await payload.delete({
        collection: 'otps',
        id: otpRecord.id,
      })

      // Provide helpful error messages based on available services
      let errorMessage = 'Failed to send OTP. Please try again.'

      if (email && !emailService.isConfigured()) {
        errorMessage = 'Email service is not configured. Please contact support.'
      } else if (phone && !smsService.isConfigured()) {
        errorMessage = 'SMS service is not configured. Please contact support.'
      } else if (email) {
        errorMessage = 'Failed to send OTP email. Please check your email address and try again.'
      } else if (phone) {
        errorMessage = 'Failed to send OTP SMS. Please check your phone number and try again.'
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 })
    }

    // Record OTP request in config manager
    otpConfig.recordOTPRequest(identifier)

    // Increment rate limiters on successful send
    dailyLimiter.increment(rateLimitKey)

    // Success response
    const isDevelopment = process.env.NODE_ENV === 'development'
    const message = email ? 'OTP sent to your email address' : 'OTP sent to your phone number'
    const remaining = otpConfig.getRemainingOTPs(identifier)

    return NextResponse.json({
      success: true,
      message: message,
      sentVia: sentVia,
      usedFallback: usedFallback,
      serviceDisabled: serviceStatus.disabled,
      remainingDailyRequests: remaining.daily,
      remainingHourlyRequests: remaining.hourly,
      cooldownMinutes: remaining.cooldownMinutes,
      ...(isDevelopment && { debugOtp: otpCode }), // Only in development
      expiresIn: 600, // 10 minutes in seconds
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 })
  }
}
