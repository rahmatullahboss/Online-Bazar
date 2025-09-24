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
  SplashCursor
} from '@/components/lazy-client-components'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN
  const blobHost = (() => {
    const match = blobToken?.match(/^vercel_blob_rw_([a-z\d]+)_[a-z\d]+$/i)
    const id = match?.[1]?.toLowerCase()
    return id ? `${id}.public.blob.vercel-storage.com` : undefined
  })()
  const enableAnalytics = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false'
  const measurementId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    process.env.NEXT_PUBLIC_GTM_MEASUREMENT_ID ||
    process.env.GA_MEASUREMENT_ID ||
    process.env.GTM_MEASUREMENT_ID

  return (
    <CartProvider>
      <main>{children}</main>
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
