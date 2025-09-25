'use client'

import React from 'react'
import { AuthProvider } from 'payload-auth-plugin/context'
import { frontendAuthClient } from '@/lib/auth'
import { CartProvider } from '@/lib/cart-context'
import { CartSidebar, Analytics, SpeedInsights, Toaster } from '@/components/lazy-client-components'
import { SplashCursor } from '@/components/splash-cursor'
import { SiteFooter } from '@/components/site-footer'
import { FloatingContactButtons } from '@/components/floating-contact-buttons'

export function Providers({ children }: { children: React.ReactNode }) {
  const enableAnalytics = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false'

  return (
    <AuthProvider client={frontendAuthClient}>
      <CartProvider>
        <main>{children}</main>
        <SiteFooter />
        <FloatingContactButtons />
        <CartSidebar />
        <SplashCursor />
        <Toaster richColors position="top-center" />
        {enableAnalytics && <Analytics />}
        {enableAnalytics && <SpeedInsights />}
      </CartProvider>
    </AuthProvider>
  )
}