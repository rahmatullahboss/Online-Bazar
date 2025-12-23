'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Plus, Minus, ShoppingCart, RefreshCw } from 'lucide-react'

import { useCart, CartItem } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ValidatedItem extends CartItem {
  hasOffer?: boolean
  offerBadge?: string
}

export const CartSidebar: React.FC = () => {
  const { state, removeItem, updateQuantity, closeCart, getTotalItems } = useCart()

  const [validatedItems, setValidatedItems] = useState<ValidatedItem[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [hasValidated, setHasValidated] = useState(false)

  // Validate cart prices against current offers
  const validatePrices = useCallback(async () => {
    if (state.items.length === 0) {
      setValidatedItems([])
      setHasValidated(true)
      return
    }

    setIsValidating(true)
    try {
      const response = await fetch('/api/cart/validate-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: state.items.map((item) => ({ id: item.id, quantity: item.quantity })),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const validated: ValidatedItem[] = data.items.map((validItem: ValidatedItem) => {
          const cartItem = state.items.find((i) => String(i.id) === String(validItem.id))
          return {
            ...validItem,
            quantity: cartItem?.quantity || validItem.quantity,
            image: validItem.image || cartItem?.image,
          }
        })
        setValidatedItems(validated)
      } else {
        setValidatedItems(state.items)
      }
    } catch (error) {
      console.error('Failed to validate prices:', error)
      setValidatedItems(state.items)
    } finally {
      setIsValidating(false)
      setHasValidated(true)
    }
  }, [state.items])

  // Validate when cart opens or items change
  useEffect(() => {
    if (state.isOpen) {
      validatePrices()
    }
  }, [state.isOpen, validatePrices])

  const displayItems = hasValidated ? validatedItems : state.items
  const totalPrice = displayItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Function to handle cart closing
  // NOTE: Removed markCartAsPotentiallyAbandoned - closing cart sidebar is not abandonment
  // Real abandonment tracking is done via beforeunload/pagehide events in cart-abandonment.ts
  const handleCloseCart = React.useCallback(() => {
    closeCart()
  }, [closeCart])

  if (!state.isOpen) return null

  return (
    <>
      {/* Enhanced Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={handleCloseCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white/95 backdrop-blur-xl border-l border-gray-200/60 shadow-2xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              Your Cart ({getTotalItems()})
              {isValidating && <RefreshCw className="w-4 h-4 text-amber-500 animate-spin ml-2" />}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseCart}
              className="h-10 w-10 p-0 hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-105"
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>

        {state.items.length === 0 ? (
          /* Empty Cart */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full mx-auto flex items-center justify-center">
                <ShoppingCart className="h-12 w-12 text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-gray-800">Your cart is empty</p>
                <p className="text-gray-600">Add some delicious snacks to get started!</p>
              </div>
              <Button
                onClick={closeCart}
                className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 border-0 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {displayItems.map((item, index) => (
                <Card
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/90 backdrop-blur-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-300/50 p-0"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Card Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-100/20 to-rose-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10 p-4">
                    <div className="flex gap-4">
                      {/* Item Image */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                        {item.image ? (
                          <Image
                            src={item.image.url}
                            alt={item.image.alt || item.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <ShoppingCart className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                        {/* Sale badge */}
                        {(item as ValidatedItem).hasOffer && (
                          <div className="absolute top-1 left-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium">
                            SALE
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-gray-800 group-hover:text-amber-600 transition-colors duration-300 leading-tight">
                            {item.name}
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-2 h-8 w-8 p-0 rounded-full"
                            onClick={() => removeItem(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-700 border border-gray-200/60 text-xs font-medium"
                        >
                          {item.category}
                        </Badge>

                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            ৳{item.price.toFixed(0)} each
                          </p>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <p className="text-sm text-gray-400 line-through">
                              ৳{item.originalPrice.toFixed(0)}
                            </p>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 pt-2">
                          <div className="flex items-center gap-2 bg-gray-50/80 rounded-full p-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full hover:bg-white transition-all duration-200"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-semibold w-8 text-center bg-white rounded-full py-1">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full hover:bg-white transition-all duration-200"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200/60">
                      <span className="text-sm text-gray-600 font-medium">Subtotal:</span>
                      <span className="text-lg font-bold text-gray-800">
                        ৳{(item.price * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm p-6 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-800">Total:</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ৳{totalPrice.toFixed(0)}
                </span>
              </div>

              <div className="h-px bg-gradient-to-r from-amber-400 to-rose-400 rounded-full"></div>

              <div className="space-y-3">
                <Button
                  asChild
                  className="w-full rounded-full border-0 bg-[linear-gradient(135deg,#F97316_0%,#F43F5E_100%)] py-3 text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-105 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-2"
                  size="lg"
                >
                  <Link href="/checkout" onClick={closeCart}>
                    Proceed to Checkout
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-gray-300 bg-white/80 backdrop-blur-sm hover:bg-gray-50 text-gray-700 py-3 rounded-full transition-all duration-300"
                  onClick={handleCloseCart}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
