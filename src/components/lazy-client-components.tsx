'use client'

import dynamic from 'next/dynamic'

export const CartSidebar = dynamic(
  () => import('@/components/cart-sidebar').then((mod) => mod.CartSidebar),
  { ssr: false },
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
  { ssr: false },
)
export const OrderStatusUpdate = dynamic(
  () => import('@/app/(frontend)/admin-dashboard/order-status-update'),
  {
    loading: () => <div className="text-xs text-gray-500">Loading...</div>,
    ssr: false,
  },
)
