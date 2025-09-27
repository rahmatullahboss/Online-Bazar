'use client'

import { OrderNowButton } from '@/components/order-now-button'
import { useState } from 'react'

export default function TestOrderButtonPage() {
  const [item] = useState({
    id: 'test-item-1',
    price: 299.99,
    name: 'Premium Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Order Button Test</h1>
        
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="mb-4 text-2xl font-semibold">{item.name}</h2>
          <p className="mb-6 text-gray-600">{item.description}</p>
          <div className="mb-6 text-3xl font-bold text-amber-600">Tk {item.price.toFixed(2)}</div>
          
          <div className="flex gap-4">
            <OrderNowButton item={item} />
          </div>
          
          <div className="mt-8 rounded-lg bg-amber-50 p-4">
            <h3 className="mb-2 font-semibold text-amber-800">How it works:</h3>
            <ul className="list-disc pl-5 text-amber-700">
              <li>Click the "Order Now" button to see the interactive loading state</li>
              <li>The button will show a pulsing animation and text change</li>
              <li>You'll be redirected to the order page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}