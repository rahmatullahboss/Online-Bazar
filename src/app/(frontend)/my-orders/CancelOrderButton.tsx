'use client'

import { useRouter } from 'next/navigation'
import { useState, startTransition } from 'react'

import { Button } from '@/components/ui/button'

export function CancelOrderButton({ orderId }: { orderId: string | number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    setLoading(true)
    try {
      await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      startTransition(() => {
        router.refresh()
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="destructive" onClick={handleCancel} disabled={loading}>
      Cancel Order
    </Button>
  )
}

