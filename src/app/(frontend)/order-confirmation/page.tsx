import React, { Suspense } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { ConfirmationClient } from './ConfirmationClient'

// Ensure this page renders per-request so query params (searchParams)
// are reflected in the server-rendered HTML and avoid hydration mismatches.
export const dynamic = 'force-dynamic'

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const { orderId } = await searchParams

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader variant="full" />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/">← Back to Home</Link>
        </Button>

        <Suspense fallback={<div className="text-sm text-gray-600">Loading confirmation…</div>}>
          <ConfirmationClient orderId={orderId} />
        </Suspense>
      </div>
    </div>
  )
}
