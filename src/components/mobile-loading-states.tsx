'use client'

import dynamic from 'next/dynamic'
import React from 'react'

// Dynamic loading states optimized for mobile performance
export const MobileProductCardSkeleton = () => (
  <div className="group relative overflow-hidden rounded-3xl border-2 border-gray-200/60 bg-white shadow-xl">
    <div className="flex h-full flex-col">
      <div className="relative aspect-[5/4] overflow-hidden rounded-t-3xl bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
      </div>
      <div className="space-y-3 p-4">
        <div className="space-y-2">
          <div className="h-6 w-3/4 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-3 w-12 rounded-full bg-gradient-to-r from-amber-200 to-rose-200 opacity-80" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded-full bg-gray-200 animate-pulse" />
          <div className="h-3 w-5/6 rounded-full bg-gray-200 animate-pulse" />
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-gray-200/60 bg-white p-4 rounded-b-3xl">
        <div className="space-y-2">
          <div className="h-6 w-24 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-3 w-20 rounded-full bg-gray-100 animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-9 w-20 rounded-full bg-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
)

export const MobileCartItemSkeleton = () => (
  <div className="bg-white/90 rounded-2xl border border-gray-200/60 p-4">
    <div className="flex gap-4">
      <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  </div>
)

export const MobileHeaderSkeleton = () => (
  <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-none sm:backdrop-blur-2xl">
    <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-200 to-rose-200 animate-pulse" />
        <div className="h-6 w-32 rounded-full bg-gray-200 animate-pulse" />
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-3">
          <div className="h-8 w-24 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-8 w-24 rounded-full bg-gray-200 animate-pulse" />
        </div>
        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
      </div>
    </div>
  </header>
)

// Dynamically loaded components with mobile-optimized loading states
export const DynamicMobileProductCard = dynamic(
  () => import('./mobile-loading-states').then((mod) => mod.MobileProductCardSkeleton),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-3xl border border-gray-200/60 p-4 animate-pulse h-64" />
    ),
  },
)

export const DynamicMobileCartItem = dynamic(
  () => import('./mobile-loading-states').then((mod) => mod.MobileCartItemSkeleton),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-2xl border border-gray-200/60 p-4 animate-pulse h-32" />
    ),
  },
)

export const DynamicMobileHeader = dynamic(
  () => import('./mobile-loading-states').then((mod) => mod.MobileHeaderSkeleton),
  {
    ssr: false,
    loading: () => (
      <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-none">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-200 to-rose-200 animate-pulse" />
            <div className="h-6 w-32 rounded-full bg-gray-200 animate-pulse" />
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
        </div>
      </header>
    ),
  },
)
