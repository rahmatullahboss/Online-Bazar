'use client'

import { useState } from 'react'

export function ProgramRegistrationForm() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const validateForm = () => {
    if (!name.trim()) {
      setError('Please enter your full name')
      return false
    }

    if (!phone.trim()) {
      setError('Please enter your phone number')
      return false
    }

    if (phone.length !== 11 || !/^\d+$/.test(phone)) {
      setError('Phone number must be exactly 11 digits')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/program/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setName('')
        setPhone('')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to submit form. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Form submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <h3 className="text-2xl font-bold text-green-800 mb-2">Registration Successful!</h3>
        <p className="text-green-700 mb-4">
          Thank you for registering. We will contact you soon with more details about the program.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          Register Another Participant
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          placeholder="Enter your full name"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number (11 digits)
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
          maxLength={11}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          placeholder="Enter 11-digit phone number"
          disabled={isSubmitting}
        />
        <p className="mt-1 text-sm text-gray-500">Example: 01712345678</p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-amber-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Register for Program'}
      </button>
    </form>
  )
}
