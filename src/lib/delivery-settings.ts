export type DeliverySettings = {
  insideDhakaCharge: number
  outsideDhakaCharge: number
  freeDeliveryThreshold: number
  digitalPaymentDeliveryCharge: number
  shippingHighlightTitle: string
  shippingHighlightSubtitle: string
}

export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  insideDhakaCharge: 80,
  outsideDhakaCharge: 120,
  freeDeliveryThreshold: 2000,
  digitalPaymentDeliveryCharge: 20,
  shippingHighlightTitle: 'Free shipping on orders over 2000 taka',
  shippingHighlightSubtitle: 'Digital wallet payments have a flat Tk 20 delivery charge.',
}

const toPositiveNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return parsed
}

const toStringOrFallback = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed.length ? trimmed : fallback
}

export const normalizeDeliverySettings = (raw: any): DeliverySettings => {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_DELIVERY_SETTINGS }
  }

  return {
    insideDhakaCharge: toPositiveNumber((raw as any).insideDhakaCharge, DEFAULT_DELIVERY_SETTINGS.insideDhakaCharge),
    outsideDhakaCharge: toPositiveNumber((raw as any).outsideDhakaCharge, DEFAULT_DELIVERY_SETTINGS.outsideDhakaCharge),
    freeDeliveryThreshold: toPositiveNumber((raw as any).freeDeliveryThreshold, DEFAULT_DELIVERY_SETTINGS.freeDeliveryThreshold),
    digitalPaymentDeliveryCharge: toPositiveNumber(
      (raw as any).digitalPaymentDeliveryCharge,
      DEFAULT_DELIVERY_SETTINGS.digitalPaymentDeliveryCharge,
    ),
    shippingHighlightTitle: toStringOrFallback(
      (raw as any).shippingHighlightTitle,
      DEFAULT_DELIVERY_SETTINGS.shippingHighlightTitle,
    ),
    shippingHighlightSubtitle: toStringOrFallback(
      (raw as any).shippingHighlightSubtitle,
      DEFAULT_DELIVERY_SETTINGS.shippingHighlightSubtitle,
    ),
  }
}
