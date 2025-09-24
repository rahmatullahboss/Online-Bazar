import React from 'react'

// We're importing globals.css in the root layout for proper loading order
// The actual CSS is loaded asynchronously for performance
import { CartProvider } from '@/lib/cart-context'
// All components are now lazy-loaded through lazy-client-components
// This reduces initial bundle size for mobile
import {
  CartSidebar,
  Analytics,
  SpeedInsights,
  Toaster,
  FloatingContactButtons,
  SiteFooter,
  SplashCursor,
} from '@/components/lazy-client-components'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const enableAnalytics = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false'

  return (
    <CartProvider>
      <main className="pt-20 pb-16 min-h-screen">
        {children}
      </main>
      <SiteFooter />
      <FloatingContactButtons />
      {/* Lazy-load the cart sidebar to reduce initial JS on mobile */}
      <CartSidebar />
      {/* Reduced size splash cursor effect */}
      <SplashCursor />
      <Toaster richColors position="top-center" />
      {enableAnalytics && <Analytics />}
      {enableAnalytics && <SpeedInsights />}
    </CartProvider>
  )
}