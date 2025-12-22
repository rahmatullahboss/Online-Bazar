'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ShinyButton } from '@/components/ui/shiny-button'

type Item = {
  id: string
  price: number
  name?: string
  image?: {
    url: string
    alt?: string
  }
  imageUrl?: string
}

type OrderNowButtonProps = {
  item: Item
  className?: string
  wrapperClassName?: string
  isLoggedIn?: boolean
  deliveryZone?: 'inside_dhaka' | 'outside_dhaka'
  compact?: boolean
}

export function OrderNowButton({
  item,
  className = '',
  wrapperClassName = '',
  compact,
}: OrderNowButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleOrder = () => {
    try {
      setLoading(true)
      setError(null)
      router.push(`/order/${item.id}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to open checkout'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col', className, wrapperClassName)}>
      <ShinyButton
        type="button"
        onClick={handleOrder}
        disabled={loading}
        size="sm"
        className={cn(
          compact
            ? 'rounded-full h-9 px-4 text-sm w-full sm:w-auto sm:h-9 sm:px-4 sm:text-xs'
            : 'rounded-full h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm md:h-11 md:px-5 md:text-sm',
        )}
      >
        {loading ? '...' : compact ? 'Order' : 'Order Now'}
      </ShinyButton>
      {error ? (
        <span className="text-xs text-red-600" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
