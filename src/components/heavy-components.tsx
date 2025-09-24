'use client'

import dynamic from 'next/dynamic'
import React from 'react'

// Dynamically import heavy components for mobile optimization
export const DynamicCartSidebar = dynamic(
  () => import('@/components/cart-sidebar').then((mod) => mod.CartSidebar),
  {
    ssr: false,
    loading: () => (
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white/90 backdrop-blur-xl border-l border-gray-200/60 shadow-2xl z-50 overflow-hidden flex flex-col animate-pulse">
        <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/90 rounded-2xl border border-gray-200/60 p-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
)

export const DynamicReviewStars = dynamic(
  () => import('@/components/review-stars').then((mod) => mod.ReviewStars),
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
  () => import('@/components/image-with-fallback').then((mod) => mod.ImageWithFallback),
  {
    ssr: false,
    loading: () => (
      <div className="bg-gray-200 animate-pulse rounded-xl" style={{ aspectRatio: '1/1' }} />
    ),
  },
)

export const DynamicSiteFooter = dynamic(
  () => import('@/components/site-footer').then((mod) => mod.SiteFooter),
  {
    ssr: false,
    loading: () => (
      <footer className="border-t border-gray-200/60 bg-gray-50/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-3 bg-gray-200 rounded w-1/2"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
        </div>
      </footer>
    ),
  },
)
