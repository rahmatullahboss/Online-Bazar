'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  customerNumber?: string | null
  deliveryZone?: 'inside_dhaka' | 'outside_dhaka' | null
  address?: {
    line1?: string | null
    line2?: string | null
    city?: string | null
    state?: string | null
    postalCode?: string | null
    country?: string | null
  }
}

export default function ProfileForm({ user }: { user: User }) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    customerNumber: user.customerNumber || '',
    address_line1: user.address?.line1 || '',
    address_line2: user.address?.line2 || '',
    address_city: user.address?.city || '',
    address_state: user.address?.state || '',
    address_postalCode: user.address?.postalCode || '',
    address_country: user.address?.country || '',
    deliveryZone: user.deliveryZone === 'outside_dhaka' ? 'outside_dhaka' : 'inside_dhaka',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          customerNumber: formData.customerNumber,
          deliveryZone: formData.deliveryZone,
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

      if (!res.ok) {
        let msg = 'Failed to update profile'
        try {
          const data = await res.json()
          msg = data?.error || data?.message || msg
        } catch {}
        throw new Error(msg)
      }

      setSuccess('Profile updated successfully')
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {success ? (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
            First name
          </label>
          <Input id="firstName" name="firstName" value={formData.firstName} onChange={onChange} />
        </div>
        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
            Last name
          </label>
          <Input id="lastName" name="lastName" value={formData.lastName} onChange={onChange} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <Input id="email" name="email" type="email" value={formData.email} onChange={onChange} />
      </div>

      <div className="space-y-2">
        <label htmlFor="customerNumber" className="text-sm font-medium text-gray-700">
          Customer number
        </label>
        <Input
          id="customerNumber"
          name="customerNumber"
          value={formData.customerNumber}
          onChange={onChange}
          placeholder="e.g. +1 555 123 4567"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">Delivery area</h3>
        <select
          name="deliveryZone"
          value={formData.deliveryZone}
          onChange={onChange}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500"
        >
          <option value="inside_dhaka">Inside Dhaka</option>
          <option value="outside_dhaka">Outside Dhaka</option>
        </select>
        <p className="text-xs text-gray-500">
          We use this to apply the correct delivery charge by default whenever you place an order.
        </p>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">Shipping address</h3>
        <div className="space-y-2">
          <label htmlFor="address_line1" className="text-sm font-medium text-gray-700">
            Address line 1
          </label>
          <Input
            id="address_line1"
            name="address_line1"
            value={formData.address_line1}
            onChange={onChange}
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
            value={formData.address_line2}
            onChange={onChange}
            placeholder="Apartment, suite, etc."
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="address_city" className="text-sm font-medium text-gray-700">
              City
            </label>
            <Input id="address_city" name="address_city" value={formData.address_city} onChange={onChange} />
          </div>
          <div className="space-y-2">
            <label htmlFor="address_state" className="text-sm font-medium text-gray-700">
              State / Region
            </label>
            <Input id="address_state" name="address_state" value={formData.address_state} onChange={onChange} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="address_postalCode" className="text-sm font-medium text-gray-700">
              Postal code
            </label>
            <Input
              id="address_postalCode"
              name="address_postalCode"
              value={formData.address_postalCode}
              onChange={onChange}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="address_country" className="text-sm font-medium text-gray-700">
              Country
            </label>
            <Input id="address_country" name="address_country" value={formData.address_country} onChange={onChange} />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}


