"use client"

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { track } from '@/lib/tracking'

type PreviewItem = {
  name?: string
  image?: { url: string; alt?: string }
}

type PreviewData = {
  items: PreviewItem[]
  subtotal?: number
  shippingCharge?: number
  totalAmount?: number
  deliveryZone?: string
  freeDeliveryApplied?: boolean
  paymentMethod?: 'cod' | 'bkash' | 'nagad'
  paymentSenderNumber?: string
  paymentTransactionId?: string
}

const toPositiveNumber = (value: unknown): number | undefined => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return undefined
  return parsed
}

const formatCurrency = (value?: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Tk 0.00'
  return `Tk ${value.toFixed(2)}`
}

export function ConfirmationClient({ orderId }: { orderId?: string }) {
  const [preview, setPreview] = useState<PreviewData | null>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('last-order-preview')
      if (raw) {
        const parsed = JSON.parse(raw)
        const items: PreviewItem[] = Array.isArray(parsed?.items) ? parsed.items : []
        setPreview({
          items,
          subtotal: toPositiveNumber(parsed?.subtotal),
          shippingCharge: toPositiveNumber(parsed?.shippingCharge),
          totalAmount: toPositiveNumber(parsed?.totalAmount),
          deliveryZone: typeof parsed?.deliveryZone === 'string' ? parsed.deliveryZone : undefined,
          freeDeliveryApplied:
            typeof parsed?.freeDeliveryApplied === 'boolean'
              ? Boolean(parsed.freeDeliveryApplied)
              : undefined,
          paymentMethod: parsed?.paymentMethod,
          paymentSenderNumber:
            typeof parsed?.paymentSenderNumber === 'string' ? parsed.paymentSenderNumber : undefined,
          paymentTransactionId:
            typeof parsed?.paymentTransactionId === 'string' ? parsed.paymentTransactionId : undefined,
        })
      }
    } catch {
      setPreview({ items: [] })
    }
  }, [])

  useEffect(() => {
    if (preview) {
      track('purchase', {
        orderId,
        items: preview.items,
        value: preview.totalAmount,
        shipping: preview.shippingCharge,
        deliveryZone: preview.deliveryZone,
        freeDeliveryApplied: preview.freeDeliveryApplied,
      })
      try {
        sessionStorage.removeItem('last-order-preview')
      } catch {}
    }
  }, [preview, orderId])

  const subtotal = useMemo(() => toPositiveNumber(preview?.subtotal) ?? 0, [preview])
  const shipping = useMemo(() => toPositiveNumber(preview?.shippingCharge) ?? 0, [preview])
  const total = useMemo(() => toPositiveNumber(preview?.totalAmount) ?? subtotal + shipping, [preview, subtotal, shipping])
  const items = preview?.items ?? []
  const freeDelivery = preview?.freeDeliveryApplied ?? shipping === 0
  const deliveryZoneLabel =
    preview?.deliveryZone === 'outside_dhaka' ? 'Outside Dhaka' : 'Inside Dhaka'
  const paymentLabel = (() => {
    switch (preview?.paymentMethod) {
      case 'bkash':
        return 'bKash'
      case 'nagad':
        return 'Nagad'
      default:
        return 'Cash on Delivery'
    }
  })()

  return (
    <>
      <Alert className="mb-6">
        <AlertDescription>
          <div className="space-y-2">
            <div className="text-lg font-semibold">Order placed successfully! ✅</div>
            {orderId ? (
              <div className="text-sm text-gray-600">Reference: #{String(orderId).slice(-8)}</div>
            ) : null}
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={`${item.name ?? 'item'}-${idx}`} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  {item.image?.url ? (
                    <div className="relative w-16 h-16 rounded overflow-hidden border">
                      <Image
                        src={item.image.url}
                        alt={item.image.alt || item.name || 'Ordered item'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="flex-1">
                    <div className="font-medium">{item.name || 'Item'}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Your order has been placed. You will receive a confirmation email shortly.
            </div>
          )}

          <Separator className="my-4" />

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery ({deliveryZoneLabel})</span>
              <span>{freeDelivery ? 'Free' : formatCurrency(shipping)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Payment method</span>
              <span>{paymentLabel}</span>
            </div>
            {preview?.paymentSenderNumber ? (
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span>Sender number</span>
                <span className="font-medium">{preview.paymentSenderNumber}</span>
              </div>
            ) : null}
            {preview?.paymentTransactionId ? (
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span>Transaction ID</span>
                <span className="font-mono break-all">{preview.paymentTransactionId}</span>
              </div>
            ) : null}
            {freeDelivery ? (
              <p className="text-xs text-green-600 font-semibold">Free delivery applied for this order.</p>
            ) : (
              <p className="text-xs text-gray-500">Delivery charge applied based on your selected area.</p>
            )}
          </div>

          <Separator className="my-4" />

          <div className="flex gap-3">
            <Button asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/my-orders">View My Orders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
