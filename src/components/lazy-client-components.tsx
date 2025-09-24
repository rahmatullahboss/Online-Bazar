'use client'

import dynamic from 'next/dynamic'

// Lazy load components with optimized settings for mobile
export const CartSidebar = dynamic(
  () => import('@/components/cart-sidebar').then((mod) => mod.CartSidebar),
  { 
    ssr: false, 
    // Show skeleton while loading to improve perceived performance
    loading: () => <div className="animate-pulse bg-muted h-96"></div>
  },
)

export const Analytics = dynamic(
  () => import('@vercel/analytics/next').then((mod) => mod.Analytics),
  { ssr: false },
)

export const SpeedInsights = dynamic(
  () => import('@vercel/speed-insights/next').then((mod) => mod.SpeedInsights),
  { ssr: false },
)

export const Toaster = dynamic(
  () => import('@/components/ui/sonner').then((mod) => mod.Toaster),
  { 
    ssr: false,
    // Optimize loading for mobile
    loading: () => <div className="h-12"></div>
  },
)

export const OrderStatusUpdate = dynamic(
  () => import('@/app/(frontend)/admin-dashboard/order-status-update'),
  {
    loading: () => <div className="text-xs text-gray-500 animate-pulse">Loading...</div>,
    ssr: false,
  },
)

// Add new lazy-loaded components for better code splitting
export const FloatingContactButtons = dynamic(
  () => import('@/components/floating-contact-buttons').then((mod) => mod.FloatingContactButtons),
  {
    ssr: false,
    loading: () => <div className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-muted animate-pulse"></div>,
  },
)

export const SiteFooter = dynamic(
  () => import('@/components/site-footer').then((mod) => mod.SiteFooter),
  {
    ssr: false,
    loading: () => <footer className="bg-muted h-48 animate-pulse"></footer>,
  },
)

export const SplashCursor = dynamic(
  () => import('@/components/splash-cursor').then((mod) => mod.SplashCursor),
  {
    ssr: false,
    loading: () => null, // Skip on mobile for performance
  },
)
