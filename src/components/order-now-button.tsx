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
}

export function OrderNowButton({
  item,
  className = '',
  wrapperClassName = '',
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
      // Note: We don't set loading to false here because we're navigating away
      // If navigation fails, we'll reset the loading state
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', wrapperClassName)}>
      <ShinyButton
        type="button"
        onClick={handleOrder}
        disabled={loading}
        size="sm"
        className={cn(
          'rounded-full h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm md:h-11 md:px-5 md:text-sm',
          loading && 'cursor-not-allowed',
          className,
        )}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="flex h-3 w-3">
              <span className="absolute h-3 w-3 animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative h-3 w-3 rounded-full bg-white"></span>
            </span>
            Confirming Order
          </span>
        ) : (
          'Order Now'
        )}
      </ShinyButton>
      {error ? (
        <span className="text-xs text-red-600" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}