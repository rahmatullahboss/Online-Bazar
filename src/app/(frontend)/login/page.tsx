'use client'

import React, { useState, useEffect, Suspense, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SiteHeader } from '@/components/site-header'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const mergeGuestCart = useCallback(async () => {
    if (typeof window === 'undefined') return
    try {
      const savedCart = window.localStorage.getItem('dyad-cart')
      if (!savedCart) return
      const parsed = JSON.parse(savedCart) as unknown
      const itemsRaw = isRecord(parsed) ? parsed.items : null
      if (!Array.isArray(itemsRaw)) {
        window.localStorage.removeItem('dyad-cart')
        return
      }

      const sessionIdRaw =
        isRecord(parsed) && typeof parsed.sessionId === 'string' ? parsed.sessionId : null

      const itemsPayload = itemsRaw
        .map((item) => {
          if (!isRecord(item)) return null
          const idValue = item.id
          if (typeof idValue !== 'string' && typeof idValue !== 'number') return null
          const quantityRaw = Number(item.quantity)
          const quantity =
            Number.isFinite(quantityRaw) && quantityRaw > 0 ? Math.floor(quantityRaw) : 0
          if (quantity <= 0) return null
          return {
            id: typeof idValue === 'number' ? String(idValue) : idValue,
            quantity,
          }
        })
        .filter((item): item is { id: string; quantity: number } => item !== null)

      if (!itemsPayload.length) {
        window.localStorage.removeItem('dyad-cart')
        return
      }

      const bodyPayload: Record<string, unknown> = { items: itemsPayload }
      if (sessionIdRaw) {
        bodyPayload.sessionId = sessionIdRaw
      }

      const response = await fetch('/api/cart/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bodyPayload),
      })

      if (!response.ok) {
        if (response.status === 401) return
        throw new Error(`Merge failed with status ${response.status}`)
      }

      const data = (await response.json().catch(() => null)) as unknown
      if (isRecord(data) && data.success === true) {
        window.localStorage.removeItem('dyad-cart')
        window.dispatchEvent(new Event('dyad-cart-merge-success'))
      }
    } catch (error) {
      console.error('Failed to merge guest cart:', error)
    }
  }, [])

  useEffect(() => {
    const messageParam = searchParams.get('message')
    if (messageParam) {
      setMessage(messageParam)
    }
  }, [searchParams])

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

    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe,
        }),
      })

      if (response.ok) {
        // Login successful, redirect to home
        await mergeGuestCart()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('dyad-auth-changed'))
        }
        router.push('/')
        router.refresh()
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Login failed. Please check your credentials.')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
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
            <h1 className="text-2xl font-bold text-gray-900">Sign in to your account</h1>
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-red-600 hover:text-red-500">
                Sign up
              </Link>
            </p>
          </div>

          {/* Login Form */}
          <Card>
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>Enter your email and password to sign in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <label htmlFor="remember-me" className="text-sm text-gray-600 select-none">
                    Keep me logged in
                  </label>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/api/oauth/google/login">
                  <svg
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </Link>
              </Button>
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
