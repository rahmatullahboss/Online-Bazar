'use client'

import React, { useState, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  itemId: string | number
  initialInWishlist?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  itemId,
  initialInWishlist = false,
  className,
  size = 'md',
  showText = false,
}) => {
  const [inWishlist, setInWishlist] = useState(initialInWishlist)
  const [isLoading, setIsLoading] = useState(false)

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const toggleWishlist = useCallback(async () => {
    setIsLoading(true)
    try {
      if (inWishlist) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist?itemId=${itemId}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setInWishlist(false)
        } else if (response.status === 401) {
          // Redirect to login if not authenticated
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId }),
        })
        if (response.ok) {
          setInWishlist(true)
        } else if (response.status === 401) {
          // Redirect to login if not authenticated
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
        }
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
    } finally {
      setIsLoading(false)
    }
  }, [itemId, inWishlist])

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleWishlist()
      }}
      disabled={isLoading}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      className={cn(
        'flex items-center justify-center gap-2 rounded-full border transition-all duration-200',
        inWishlist
          ? 'border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100'
          : 'border-stone-200 bg-white/80 text-stone-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-400',
        isLoading && 'opacity-50 cursor-not-allowed',
        showText ? 'px-4 py-2' : sizeClasses[size],
        className,
      )}
    >
      <Heart
        className={cn(
          iconSizes[size],
          'transition-transform duration-200',
          inWishlist && 'fill-current scale-110',
          !isLoading && 'group-hover:scale-110',
        )}
      />
      {showText && (
        <span className="text-sm font-medium">{inWishlist ? 'Wishlisted' : 'Add to Wishlist'}</span>
      )}
    </button>
  )
}

export default WishlistButton
