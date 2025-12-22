'use client'

import { CardFooter } from '@/components/ui/card'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { OrderNowButton } from '@/components/order-now-button'

type ProductItem = {
  id: string
  name: string
  price: number
  image?: {
    url: string
    alt?: string
  }
  imageUrl?: string
}

type ProductCardFooterProps = {
  item: ProductItem
  isLoggedIn?: boolean
  deliveryZone?: 'inside_dhaka' | 'outside_dhaka'
}

export function ProductCardFooter({
  item,
  isLoggedIn = false,
  deliveryZone = 'inside_dhaka',
}: ProductCardFooterProps) {
  return (
    <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2 border-t border-gray-100 bg-white p-2.5 sm:p-4 rounded-b-xl sm:rounded-b-3xl mt-auto">
      {/* First row on mobile: Price + Add button */}
      <div className="flex items-center justify-between w-full sm:w-auto sm:gap-2">
        <span className="text-lg sm:text-2xl font-bold text-gray-900">
          ৳{item.price.toLocaleString()}
        </span>
        <AddToCartButton
          item={item}
          compact
          className="sm:hidden !px-3 !py-1.5 !rounded-full !border-2 !border-amber-500 !bg-amber-50 hover:!bg-amber-500 !text-amber-600 hover:!text-white transition-all !font-medium !text-xs"
        />
      </div>
      {/* Second row on mobile: Full width Order button */}
      <div className="flex gap-2 w-full sm:w-auto">
        <AddToCartButton
          item={item}
          compact
          className="hidden sm:flex !px-2.5 !py-1.5 !rounded-full !border-2 !border-amber-500 !bg-amber-50 hover:!bg-amber-500 !text-amber-600 hover:!text-white transition-all !font-medium !text-sm"
        />
        <OrderNowButton
          item={item}
          isLoggedIn={isLoggedIn}
          deliveryZone={deliveryZone}
          compact
          wrapperClassName="w-full sm:w-auto"
        />
      </div>
    </CardFooter>
  )
}
