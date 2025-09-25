'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SiteHeader } from '@/components/site-header'
import { Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address_line1: '',
    address_line2: '',
    address_city: '',
    address_state: '',
    address_postalCode: '',
    address_country: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('All fields are required')
      setIsSubmitting(false)
      return
    }

    // Optional: basic address validation (require at least line1, city, postalCode, country)
    if (!formData.address_line1 || !formData.address_city || !formData.address_postalCode || !formData.address_country) {
      setError('Please provide your shipping address (line 1, city, postal code, country)')
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

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: 'user',
          address: {
            line1: formData.address_line1,
            line2: formData.address_line2 || undefined,
            city: formData.address_city,
            state: formData.address_state || undefined,
            postalCode: formData.address_postalCode,
            country: formData.address_country,
          },
        }),
      })

      if (response.ok) {
        // Registration successful, redirect to login
        router.push('/login?message=Registration successful! Please log in.')
      } else {
        const errorData = await response.json()
        console.error('Registration error:', response.status, errorData)
        setError(
          errorData.message ||
            errorData.errors?.[0]?.message ||
            'Registration failed. Please try again.',
        )
      }
    } catch (err) {
      console.error('Registration fetch error:', err)
      setError('Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader variant="full" />
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-red-600 hover:text-red-500">
                Sign in
              </Link>
            </p>
          </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                />
              </div>

              {/* Address */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Shipping address</h4>
                <div className="space-y-2">
                  <label htmlFor="address_line1" className="text-sm font-medium text-gray-700">
                    Address line 1
                  </label>
                  <Input
                    id="address_line1"
                    name="address_line1"
                    type="text"
                    required
                    value={formData.address_line1}
                    onChange={handleInputChange}
                    placeholder="House, street, area"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="address_line2" className="text-sm font-medium text-gray-700">
                    Address line 2 (optional)
                  </label>
                  <Input
                    id="address_line2"
                    name="address_line2"
                    type="text"
                    value={formData.address_line2}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, etc."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="address_city" className="text-sm font-medium text-gray-700">
                      City
                    </label>
                    <Input
                      id="address_city"
                      name="address_city"
                      type="text"
                      required
                      value={formData.address_city}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="address_state" className="text-sm font-medium text-gray-700">
                      State / Region
                    </label>
                    <Input
                      id="address_state"
                      name="address_state"
                      type="text"
                      value={formData.address_state}
                      onChange={handleInputChange}
                      placeholder="State or region"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="address_postalCode" className="text-sm font-medium text-gray-700">
                      Postal code
                    </label>
                    <Input
                      id="address_postalCode"
                      name="address_postalCode"
                      type="text"
                      required
                      value={formData.address_postalCode}
                      onChange={handleInputChange}
                      placeholder="Postal code"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="address_country" className="text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <Input
                      id="address_country"
                      name="address_country"
                      type="text"
                      required
                      value={formData.address_country}
                      onChange={handleInputChange}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
    </div>
  )
}
