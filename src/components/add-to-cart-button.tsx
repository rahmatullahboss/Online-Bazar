'use client'

import React, { useState } from 'react'
import { Plus, Check } from 'lucide-react'

import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import type { CartItem } from '@/lib/cart-context'
import { cn } from '@/lib/utils'
import { track } from '@/lib/tracking'

interface AddToCartButtonProps {
  item: {
    id: string
    name: string
    price: number
    originalPrice?: number // Original price before discount
    category?: any
    image?: {
      url: string
      alt?: string
    }
    imageUrl?: string
  }
  className?: string
  compact?: boolean
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ item, className, compact }) => {
  const { addItem, openCart } = useCart()
  const [isAdded, setIsAdded] = useState(false)
  const [isAdding, setIsAdding] = useState(false) // Prevent rapid clicks

  const handleAddToCart = () => {
    // Prevent multiple rapid clicks
    if (isAdding) return

    setIsAdding(true)

    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice, // Pass original price for cart display
      category:
        typeof (item as any).category === 'object'
          ? ((item as any).category as any)?.name
          : (item as any).category,
      image: item.image || (item.imageUrl ? { url: item.imageUrl } : undefined),
    })

    track('addToCart', { id: item.id, name: item.name, price: item.price })

    setIsAdded(true)

    // Show feedback for 1 second
    setTimeout(() => {
      setIsAdded(false)
      setIsAdding(false) // Re-enable button
    }, 1000)
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdded || isAdding}
      size="sm"
      className={cn(
        compact
          ? 'h-7 px-2 text-[11px] sm:h-9 sm:px-3 sm:text-xs'
          : 'h-9 px-2 text-xs sm:h-10 sm:px-3 sm:text-sm md:h-11 md:px-4 md:text-sm',
        isAdded && 'bg-green-600 hover:bg-green-600',
        className,
      )}
    >
      {isAdded ? (
        <React.Fragment>
          <Check
            className={cn(
              compact
                ? 'h-3 w-3 mr-0.5'
                : 'h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-1 sm:mr-1 md:mr-2',
            )}
          />
          <span>{compact ? '✓' : 'Added!'}</span>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Plus
            className={cn(
              compact
                ? 'h-3 w-3 mr-0.5'
                : 'h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-1 sm:mr-1 md:mr-2',
            )}
          />
          <span>{compact ? 'Add' : 'Add to Cart'}</span>
        </React.Fragment>
      )}
    </Button>
  )
}
