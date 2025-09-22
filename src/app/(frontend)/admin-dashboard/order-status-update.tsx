'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface OrderStatusUpdateProps {
  orderId: string
  currentStatus: string
}

export default function OrderStatusUpdate({ orderId, currentStatus }: OrderStatusUpdateProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus === status) return

    setIsUpdating(true)
    setError('')

    try {
      const response = await fetch('/api/orders/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      })

      if (response.ok) {
        setStatus(newStatus)
        router.refresh() // Refresh the page to show updated data
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to update status')
      }
    } catch (err) {
      setError('Failed to update status. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-2">
      <Select value={status} onValueChange={(val) => handleStatusUpdate(val)}>
        <SelectTrigger size="sm" aria-label="Update order status">
          <SelectValue placeholder="Set status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">⏳ Pending</SelectItem>
          <SelectItem value="processing">🔄 Processing</SelectItem>
          <SelectItem value="shipped">📦 Shipped</SelectItem>
          <SelectItem value="completed">✅ Completed</SelectItem>
          <SelectItem value="cancelled">❌ Cancelled</SelectItem>
          <SelectItem value="refunded">💰 Refunded</SelectItem>
        </SelectContent>
      </Select>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {isUpdating && <div className="text-xs text-gray-500">Updating…</div>}
    </div>
  )
}
