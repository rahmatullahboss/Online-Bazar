'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { OTPInput } from '@/components/ui/otp-input'
import { Loader2, Mail, Smartphone, RefreshCw } from 'lucide-react'

interface OTPVerificationProps {
  email?: string
  phone?: string
  type?: 'registration' | 'login' | 'password_reset' | 'phone_verification'
  onVerified: (success: boolean, data?: any) => void
  onResend?: () => void
  title?: string
  description?: string
  className?: string
}

export function OTPVerification({
  email,
  phone,
  type = 'registration',
  onVerified,
  onResend,
  title = 'Verify Your Code',
  description,
  className,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(false)

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleOTPChange = (value: string) => {
    setOtp(value)
    setError('')
    setSuccess('')
  }

  const handleOTPComplete = async (value: string) => {
    if (value.length !== 6) return

    setIsVerifying(true)
    setError('')

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phone,
          code: value,
          type,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('OTP verified successfully!')
        onVerified(true, data)
      } else {
        setError(data.error || 'Verification failed')
        onVerified(false, data)
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      setError('Network error. Please try again.')
      onVerified(false)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!canResend || isResending) return

    setIsResending(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phone,
          type,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('New OTP sent successfully!')
        setCountdown(60) // 60 seconds countdown
        setCanResend(false)
        onResend?.()
      } else {
        setError(data.error || 'Failed to resend OTP')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const getContactInfo = () => {
    if (email) {
      return {
        icon: Mail,
        text: email,
        label: 'email address',
      }
    }
    if (phone) {
      return {
        icon: Smartphone,
        text: phone,
        label: 'phone number',
      }
    }
    return null
  }

  const contactInfo = getContactInfo()

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        {description && <CardDescription className="text-base">{description}</CardDescription>}
        {contactInfo && (
          <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg">
            <contactInfo.icon className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-800">Code sent to your {contactInfo.label}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">Enter the 6-digit code we sent to you</p>
            <OTPInput
              length={6}
              onComplete={handleOTPComplete}
              onChange={handleOTPChange}
              disabled={isVerifying}
            />
          </div>

          {isVerifying && (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Verifying...</span>
            </div>
          )}
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Didn't receive the code?</p>

          {canResend ? (
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={isResending}
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Code
                </>
              )}
            </Button>
          ) : (
            <div className="text-sm text-gray-500">Resend available in {countdown} seconds</div>
          )}
        </div>

        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>• The code will expire in 10 minutes</p>
          <p>• Check your spam folder if you don't see the email</p>
        </div>
      </CardContent>
    </Card>
  )
}
