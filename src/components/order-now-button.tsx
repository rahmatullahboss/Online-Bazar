'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShinyButton } from '@/components/ui/shiny-button' // Changed from Button to ShinyButton
import { cn } from '@/lib/utils'

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
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', wrapperClassName)}>
      <ShinyButton // Changed from Button to ShinyButton
        type="button"
        onClick={handleOrder}
        disabled={loading}
        className={cn(
          'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 border-0 text-white rounded-full shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105 h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm md:h-11 md:px-5 md:text-sm',
          className,
        )}
      >
        {loading ? 'Ordering.' : 'Order Now'}
      </ShinyButton>
      {/* Changed from Button to ShinyButton */}
      {error ? (
        <span className="text-xs text-red-600" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
