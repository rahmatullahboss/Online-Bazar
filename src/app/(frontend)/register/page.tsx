'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SiteHeader } from '@/components/site-header'
import { OTPVerification } from '@/components/ui/otp-verification'
import { Loader2, ArrowLeft } from 'lucide-react'

type RegistrationStep = 'form' | 'otp-verification' | 'success'

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('form')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    address_city: '',
    address_state: '',
    address_postalCode: '',
    address_country: 'Bangladesh',
    deliveryZone: 'inside_dhaka',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const sendOTP = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone || undefined,
          type: 'registration',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setCurrentStep('otp-verification')
        setSuccess('OTP sent successfully! Please check your email.')
      } else {
        setError(data.error || 'Failed to send OTP. Please try again.')
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields')
      setIsSubmitting(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsSubmitting(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsSubmitting(false)
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      setIsSubmitting(false)
      return
    }

    // Optional phone validation
    if (formData.phone && !/^01[3-9]\d{8}$/.test(formData.phone)) {
      setError('Please enter a valid Bangladeshi phone number (01XXXXXXXXX)')
      setIsSubmitting(false)
      return
    }

    // Send OTP
    await sendOTP()
  }

  const handleOTPVerified = async (success: boolean, data?: any) => {
    if (!success) {
      setError(data?.error || 'OTP verification failed')
      return
    }

    // Proceed with user registration
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          address: {
            line1: formData.address_line1 || undefined,
            line2: formData.address_line2 || undefined,
            city: formData.address_city || undefined,
            state: formData.address_state || undefined,
            postalCode: formData.address_postalCode || undefined,
            country: formData.address_country,
          },
          deliveryZone: formData.deliveryZone,
          otpCode: data?.otpCode || '', // This will be handled by the verification
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setCurrentStep('success')
        setSuccess('Account created successfully!')
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login?message=Account created successfully! Please log in.')
        }, 2000)
      } else {
        setError(result.error || 'Registration failed. Please try again.')
        setCurrentStep('form') // Go back to form
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Network error. Please try again.')
      setCurrentStep('form') // Go back to form
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToForm = () => {
    setCurrentStep('form')
    setError('')
    setSuccess('')
  }

  const renderForm = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
        <CardDescription className="text-center">
          Join Online Bazar and start shopping today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (Optional)
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="01XXXXXXXXX"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password *
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="deliveryZone" className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Zone *
            </label>
            <select
              id="deliveryZone"
              name="deliveryZone"
              value={formData.deliveryZone}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="inside_dhaka">Inside Dhaka</option>
              <option value="outside_dhaka">Outside Dhaka</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Address (Optional)</label>
            <Input
              name="address_line1"
              placeholder="Address Line 1"
              value={formData.address_line1}
              onChange={handleInputChange}
              className="w-full"
            />
            <Input
              name="address_line2"
              placeholder="Address Line 2"
              value={formData.address_line2}
              onChange={handleInputChange}
              className="w-full"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                name="address_city"
                placeholder="City"
                value={formData.address_city}
                onChange={handleInputChange}
                className="w-full"
              />
              <Input
                name="address_postalCode"
                placeholder="Postal Code"
                value={formData.address_postalCode}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              'Send Verification Code'
            )}
          </Button>

          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )

  const renderOTPVerification = () => (
    <div className="w-full max-w-md mx-auto">
      <Button variant="outline" onClick={handleBackToForm} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Form
      </Button>

      <OTPVerification
        email={formData.email}
        phone={formData.phone || undefined}
        type="registration"
        onVerified={handleOTPVerified}
        title="Verify Your Email"
        description="We've sent a 6-digit verification code to your email address"
      />
    </div>
  )

  const renderSuccess = () => (
    <Card className="w-full max-w-md mx-auto text-center">
      <CardContent className="pt-6">
        <div className="mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Account Created!</h2>
          <p className="text-gray-600">
            Your account has been successfully created. Redirecting to login...
          </p>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          {currentStep === 'form' && renderForm()}
          {currentStep === 'otp-verification' && renderOTPVerification()}
          {currentStep === 'success' && renderSuccess()}
        </div>
      </div>
    </div>
  )
}
