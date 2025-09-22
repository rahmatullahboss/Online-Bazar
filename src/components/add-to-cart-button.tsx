'use client'

import React, { useState } from 'react'
import { Plus, Check } from 'lucide-react'

import { useCart } from '@/lib/cart-context'
import { ShinyButton } from '@/components/ui/shiny-button' // Changed from Button to ShinyButton
import type { CartItem } from '@/lib/cart-context'
import { cn } from '@/lib/utils'
import { track } from '@/lib/tracking'

interface AddToCartButtonProps {
  item: {
    id: string
    name: string
    price: number
    category?: any
    image?: {
      url: string
      alt?: string
    }
    imageUrl?: string
  }
  className?: string
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ item, className }) => {
  const { addItem, openCart } = useCart()
  const [isAdded, setIsAdded] = useState(false)
  const [isAdding, setIsAdding] = useState(false) // Prevent rapid clicks

  const handleAddToCart = () => {
    // Prevent multiple rapid clicks
    if (isAdding) return

    setIsAdding(true)

    console.log('Adding item to cart:', item)

    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
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

    // Optional: Open cart after adding item
    // openCart()
  }

  return (
    <ShinyButton // Changed from Button to ShinyButton
      onClick={handleAddToCart}
      disabled={isAdded || isAdding}
      className={cn(
        'h-9 px-2 text-xs',
        'sm:h-10 sm:px-3 sm:text-sm',
        'md:h-11 md:px-4 md:text-sm',
        isAdded && 'bg-green-600 hover:bg-green-600',
        className,
      )}
    >
      {isAdded ? (
        <>
          <Check className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-1 sm:mr-1 md:mr-2" />
          <span>Added!</span>
        </>
      ) : (
        <>
          <Plus className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-1 sm:mr-1 md:mr-2" />
          <span>Add to Cart</span>
        </>
      )}
    </ShinyButton> // Changed from Button to ShinyButton
  )
}
