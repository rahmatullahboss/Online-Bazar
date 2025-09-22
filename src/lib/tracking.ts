const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'BDT'
const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GTM_MEASUREMENT_ID

type TrackParams = Record<string, unknown>

type TrackEvent = {
  name: string
  params: TrackParams
}

const toNumber = (value: unknown) => {
  const parsed = typeof value === 'string' ? Number(value) : (value as number)
  if (typeof parsed !== 'number' || !Number.isFinite(parsed)) return undefined
  return Number(parsed.toFixed(2))
}

const cleanup = (params: TrackParams) => {
  const cleaned: TrackParams = {}
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) {
      const inner = value
        .map((item) => {
          if (item && typeof item === 'object') {
            const entries = Object.entries(item as Record<string, unknown>).filter(
              ([, val]) => val !== undefined && val !== null,
            )
            return entries.length ? Object.fromEntries(entries) : null
          }
          return item
        })
        .filter(Boolean)
      if (inner.length) cleaned[key] = inner
      return
    }
    cleaned[key] = value
  })
  return cleaned
}

const mapEvent = (event: string, data: Record<string, any>): TrackEvent => {
  switch (event) {
    case 'addToCart': {
      const price = toNumber(data.price)
      const quantity = typeof data.quantity === 'number' && data.quantity > 0 ? data.quantity : 1
      const value = price !== undefined ? Number((price * quantity).toFixed(2)) : undefined
      return {
        name: 'add_to_cart',
        params: cleanup({
          currency: DEFAULT_CURRENCY,
          value,
          items: [
            cleanup({
              item_id: data.id || data.item_id || data.sku,
              item_name: data.name,
              price,
              quantity,
              item_category: data.category,
            }),
          ],
        }),
      }
    }
    case 'purchase': {
      const shipping = toNumber(data.shipping ?? data.shippingAmount)
      const value = toNumber(data.value ?? data.total ?? data.totalAmount)
      const items = Array.isArray(data.items)
        ? data.items.map((item) =>
            cleanup({
              item_id: item?.id || item?.item_id || item?.sku,
              item_name: item?.name,
              price: toNumber(item?.price),
              quantity: typeof item?.quantity === 'number' ? item.quantity : undefined,
              item_category: item?.category,
            }),
          )
        : undefined
      return {
        name: 'purchase',
        params: cleanup({
          transaction_id: data.orderId || data.transactionId || data.id,
          currency: DEFAULT_CURRENCY,
          value,
          shipping,
          coupon: typeof data.coupon === 'string' ? data.coupon : undefined,
          items,
        }),
      }
    }
    default: {
      const safeData = data && typeof data === 'object' ? data : { value: data }
      return {
        name: event,
        params: cleanup(safeData),
      }
    }
  }
}

const getClientId = () => {
  try {
    const cookies = document.cookie.split(';').map((entry) => entry.trim())
    const gaCookie = cookies.find((entry) => entry.startsWith('_ga='))
    if (!gaCookie) return undefined
    const raw = decodeURIComponent(gaCookie.split('=')[1] ?? '')
    const parts = raw.split('.')
    if (parts.length >= 4) {
      return `${parts[2]}.${parts[3]}`
    }
    if (parts.length === 2) {
      return `${parts[0]}.${parts[1]}`
    }
  } catch {}
  return undefined
}

const postToServer = (name: string, params: TrackParams) => {
  try {
    const payload = {
      events: [
        {
          name,
          params,
          clientId: getClientId(),
        },
      ],
    }
    fetch('/api/tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})
  } catch {}
}

export const track = (event: string, data?: Record<string, any>) => {
  if (typeof window === 'undefined') return
  const mapped = mapEvent(event, data || {})

  const dataLayer = ((window as any).dataLayer = (window as any).dataLayer || [])
  dataLayer.push({ event: mapped.name, ...mapped.params, originalEventName: event })

  const gtag = (window as any).gtag
  if (typeof gtag === 'function' && (MEASUREMENT_ID || (window as any).google_tag_manager)) {
    try {
      gtag('event', mapped.name, mapped.params)
    } catch {}
  }

  postToServer(mapped.name, mapped.params)
}

