import React from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'

import { CartProvider } from '@/lib/cart-context'
import { SiteFooter } from '@/components/site-footer'
import { FloatingContactButtons } from '@/components/floating-contact-buttons'
import '../globals.css'
import { CartSidebar, Analytics, SpeedInsights, Toaster } from '@/components/lazy-client-components'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { ChatBot } from '@/components/chat-bot'
import storeConfig from '@/config/store.config'

export const metadata: Metadata = {
  description: storeConfig.description,
  title: {
    default: storeConfig.name,
    template: storeConfig.seo.titleTemplate,
  },
  icons: {
    icon: '/favicon-round.png',
    shortcut: '/favicon-round.png',
    apple: '/favicon-round.png',
  },
  openGraph: {
    title: storeConfig.name,
    description: storeConfig.description,
    url: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000',
    siteName: storeConfig.name,
    images: [
      {
        url: storeConfig.seo.ogImage,
        width: 1200,
        height: 630,
        alt: `${storeConfig.name} preview`,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: storeConfig.name,
    description: storeConfig.description,
    images: [storeConfig.seo.ogImage],
  },
  other: {
    'fb:app_id': process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
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
    <html lang="en">
      <head>
        {/* Performance hints for mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={storeConfig.name} />
        <link rel="apple-touch-icon" href="/favicon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Preconnects to speed up first requests on mobile */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        {blobHost ? (
          <link rel="preconnect" href={`https://${blobHost}`} crossOrigin="anonymous" />
        ) : null}
        {/* DNS prefetch as a lightweight fallback */}
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        {blobHost ? <link rel="dns-prefetch" href={`//${blobHost}`} /> : null}

        {/* Google Analytics - deferred loading */}
        {measurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
              strategy="afterInteractive"
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${measurementId}');
                  window.__GA_MEASUREMENT_ID = '${measurementId}';
                `,
              }}
            />
          </>
        ) : null}
      </head>
      <body>
        <CartProvider>
          <main className="pb-16 md:pb-0">{children}</main>
          <SiteFooter />
          <FloatingContactButtons />
          <CartSidebar />
          {/* Mobile bottom navigation */}
          <MobileBottomNav />
          <ChatBot />
          <Toaster richColors position="top-center" />
          {enableAnalytics && <Analytics />}
          {enableAnalytics && <SpeedInsights />}
        </CartProvider>
      </body>
    </html>
  )
}
