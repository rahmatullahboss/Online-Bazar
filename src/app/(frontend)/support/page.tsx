'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SiteHeader } from '@/components/site-header'

interface User {
  id: number
  email: string
  firstName?: string
  lastName?: string
}

export default function SupportPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    email: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isLoggedIn = !!user

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/users/me', {
          credentials: 'include',
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          if (userData.email) {
            setFormData((prev) => ({ ...prev, email: userData.email }))
          }
        }
      } catch (err) {
        console.error('Failed to fetch user:', err)
      } finally {
        setLoadingUser(false)
      }
    }

    fetchUser()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    setSuccess('')

    if (!formData.subject.trim() || !formData.message.trim()) {
      setError('Subject and message are required')
      setIsSubmitting(false)
      return
    }

    if (!isLoggedIn && (!formData.email.trim() || !formData.email.includes('@'))) {
      setError('Valid email is required')
      setIsSubmitting(false)
      return
    }

    try {
      const body = {
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      } as {
        subject: string
        message: string
        email?: string
      }

      if (!isLoggedIn) {
        body.email = formData.email.trim()
      }

      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (response.ok) {
        setSuccess(
          'Your support ticket has been submitted successfully! We&#39;ll get back to you soon.',
        )
        setFormData({ subject: '', message: '', email: formData.email })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to submit ticket. Please try again.')
      }
    } catch (err) {
      console.error('Support submission error:', err)
      setError('Failed to submit ticket. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader variant="full" />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader variant="full" />
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">Submit a Support Request</h1>
            <p className="text-sm text-gray-600">
              Describe your issue below and we&#39;ll help you as soon as possible.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Support Ticket</CardTitle>
              <CardDescription>Tell us about your problem</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g., Order not received"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Describe your issue in detail..."
                    rows={4}
                    disabled={isSubmitting}
                  />
                </div>

                {!isLoggedIn && (
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email (for response)
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                {isLoggedIn && (
                  <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md">
                    Logged in as: {user?.email || 'User'}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </Button>
              </form>
            </CardContent>
          </Card>

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
