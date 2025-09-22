'use client'

import React from 'react'
import { ShinyButton } from '@/components/ui/shiny-button'

export default function TestShinyButton() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">Shiny Button Test</h1>

      <div className="space-y-6">
        <ShinyButton className="text-lg px-8 py-4">Add to Cart</ShinyButton>

        <ShinyButton className="text-lg px-8 py-4 bg-gradient-to-r from-amber-500 to-rose-500">
          Order Now
        </ShinyButton>

        <ShinyButton className="text-lg px-8 py-4 bg-[linear-gradient(135deg,#F97316_0%,#F43F5E_100%)]">
          Confirm Order
        </ShinyButton>
      </div>
    </div>
  )
}
