'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { DEFAULT_DELIVERY_SETTINGS } from '@/lib/delivery-settings'

export default function CartPage() {
  const router = useRouter()
  const { state, removeItem, updateQuantity, clearCart } = useCart()
  const { items } = state

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const isFreeDelivery = subtotal >= DEFAULT_DELIVERY_SETTINGS.freeDeliveryThreshold
  const deliveryCharge =
    subtotal > 0 && !isFreeDelivery ? DEFAULT_DELIVERY_SETTINGS.insideDhakaCharge : 0
  const total = subtotal + deliveryCharge

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader variant="full" />
        <div className="container mx-auto px-4 pt-4 pb-24 md:pt-24">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some items to get started</p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <SiteHeader variant="full" />

      <div className="container mx-auto px-4 pt-4 pb-40 md:pt-20 md:pb-24 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-6 flex-wrap">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Your Cart</h1>
          <span className="text-gray-500 text-sm sm:text-base">({items.length} items)</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 min-w-0">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 sm:gap-4 bg-white rounded-xl p-3 sm:p-4 shadow-sm overflow-hidden"
              >
                {/* Image */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.image?.url ? (
                    <Image src={item.image.url} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <h3 className="font-medium text-gray-800 truncate text-sm sm:text-base">
                    {item.name}
                  </h3>
                  {item.category && (
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{item.category}</p>
                  )}
                  <div className="mt-1">
                    <p className="text-base sm:text-lg font-bold text-green-600">
                      ৳{item.price.toFixed(0)}
                    </p>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <p className="text-xs sm:text-sm text-gray-500 line-through">
                        ৳{item.originalPrice.toFixed(0)}
                      </p>
                    )}
                  </div>
                </div>
                {/* Quantity Controls */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 bg-gray-100 rounded-full">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart */}
            <button
              onClick={clearCart}
              className="w-full py-3 text-red-500 hover:text-red-600 text-sm font-medium"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">৳{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  {isFreeDelivery ? (
                    <span className="font-medium text-green-600">Free</span>
                  ) : (
                    <span className="font-medium">৳{deliveryCharge}</span>
                  )}
                </div>
                {!isFreeDelivery && subtotal > 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                    Add ৳{(DEFAULT_DELIVERY_SETTINGS.freeDeliveryThreshold - subtotal).toFixed(0)}{' '}
                    more for free delivery!
                  </p>
                )}
                {isFreeDelivery && (
                  <p className="text-xs text-green-600 bg-green-50 rounded-lg p-2">
                    🎉 You qualify for free delivery!
                  </p>
                )}
                <div className="border-t pt-3 flex justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-green-600">৳{total.toFixed(0)}</span>
                </div>
              </div>

              <Button asChild className="w-full mt-6" size="lg">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Delivery charge may vary based on location
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
