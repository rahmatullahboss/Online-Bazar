'use client'

import dynamic from 'next/dynamic'
import React from 'react'

// Dynamically import product-related components for mobile optimization
export const DynamicReviewStars = dynamic(
  () => import('@/components/heavy-components').then((mod) => mod.DynamicReviewStars),
  {
    ssr: false,
    loading: () => (
      <div className="inline-flex items-center gap-0.5">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>
    ),
  },
)

export const DynamicImageWithFallback = dynamic(
  () => import('@/components/heavy-components').then((mod) => mod.DynamicImageWithFallback),
  {
    ssr: false,
    loading: () => (
      <div className="bg-gray-200 animate-pulse rounded-xl" style={{ aspectRatio: '1/1' }} />
    ),
  },
)

// Export a wrapper component for product images with better loading states
export const ProductImage = dynamic(
  () => import('@/components/heavy-components').then((mod) => mod.DynamicImageWithFallback),
  {
    ssr: false,
    loading: () => (
      <div className="relative bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
        </div>
      </div>
    ),
  },
)
