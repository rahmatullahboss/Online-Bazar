import React from 'react'
import type { Metadata } from 'next'

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

export const metadata: Metadata = {
  description:
    'Experience the future of shopping with our curated collection of premium items, delivered with precision and passion.',
  title: {
    default: 'Online Bazar',
    template: '%s | Online Bazar',
  },
  icons: {
    icon: '/favicon-round.png',
    shortcut: '/favicon-round.png',
    apple: '/favicon-round.png',
  },
  openGraph: {
    title: 'Online Bazar',
    description:
      'Experience the future of shopping with our curated collection of premium items, delivered with precision and passion.',
    url: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000',
    siteName: 'Online Bazar',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Online Bazar preview',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Bazar',
    description:
      'Experience the future of shopping with our curated collection of premium items, delivered with precision and passion.',
    images: ['/og-image.png'],
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
        
        {/* Inline critical CSS for faster first paint */}
        <style jsx>{`
          /* Critical styles needed for above-the-fold content */
          body {
            margin: 0;
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.5;
          }
          main {
            min-height: calc(100vh - var(--footer-height, 200px));
          }
          .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
          }
          @media (min-width: 768px) {
            .container {
              padding: 0 2rem;
            }
          }
        `}</style>
        
        {/* Preload critical fonts and stylesheet */}
        <link rel="preload" href="/css/0f4358139da52c82.css" as="style" />
        
        {/* Load non-critical CSS asynchronously */}
        <link rel="stylesheet" href="/css/0f4358139da52c82.css" media="print" onLoad={(e) => { (e.target as HTMLLinkElement).media = 'all'; }} />
        <noscript><link rel="stylesheet" href="/css/0f4358139da52c82.css" /></noscript>
        {/* Preconnects to speed up first requests on mobile */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        {blobHost ? (
          <link rel="preconnect" href={`https://${blobHost}`} crossOrigin="anonymous" />
        ) : null}
        {/* DNS prefetch as a lightweight fallback */}
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        {blobHost ? <link rel="dns-prefetch" href={`//${blobHost}`} /> : null}

        {/* Google Analytics (gtag.js) */}
        {measurementId ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            ></script>
            <script
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
      </body>
    </html>
  )
}
