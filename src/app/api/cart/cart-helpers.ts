import type { NextRequest } from 'next/server'
import type { Payload } from 'payload'

export const resolveSessionIdFromRequest = (request: NextRequest): string | null => {
  const urlSession = request.nextUrl.searchParams.get('sessionId')
  if (typeof urlSession === 'string' && urlSession.trim().length > 0) {
    return urlSession.trim()
  }

  const headerSession = request.headers.get('x-dyad-cart-session')
  if (typeof headerSession === 'string' && headerSession.trim().length > 0) {
    return headerSession.trim()
  }

  const cookieSession = request.cookies.get('dyad_cart_sid')?.value
  if (typeof cookieSession === 'string' && cookieSession.trim().length > 0) {
    return cookieSession.trim()
  }

  return null
}

export type CartLine = { item: number; quantity: number }
export type IncomingCartItem = { id: string | number; quantity: number }
export type SerializedCartItem = {
  id: string
  name: string
  price: number
  quantity: number
  category: string
  image?: {
    url: string
    alt?: string
  }
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const coerceNumericId = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.floor(value)
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (/^\d+$/.test(trimmed)) {
      return Number(trimmed)
    }
  }
  return null
}

export const toItemId = (value: unknown): number | null => {
  const direct = coerceNumericId(value)
  if (direct !== null) return direct

  if (isRecord(value)) {
    const candidateKeys = ['id', 'value', '_id'] as const
    for (const key of candidateKeys) {
      if (!(key in value)) continue
      const candidate = (value as Record<string, unknown>)[key]
      const numeric = coerceNumericId(candidate)
      if (numeric !== null) {
        return numeric
      }
      if (isRecord(candidate)) {
        const nested = toItemId(candidate)
        if (nested !== null) {
          return nested
        }
      }
    }
  }

  return null
}

export const resolveUserId = (user: unknown): number | string | null => {
  if (!isRecord(user)) return null
  const idRaw = user.id
  if (typeof idRaw === 'number' && Number.isFinite(idRaw)) return idRaw
  if (typeof idRaw === 'string') {
    const trimmed = idRaw.trim()
    if (trimmed.length === 0) return null
    const numeric = toItemId(trimmed)
    return numeric ?? trimmed
  }
  const numeric = toItemId(idRaw)
  return numeric
}

const pickCategoryName = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (isRecord(value) && typeof value.name === 'string') return value.name
  return ''
}

const pickImage = (itemDoc: Record<string, unknown>): SerializedCartItem['image'] => {
  const imageValue = itemDoc.image
  if (isRecord(imageValue) && typeof imageValue.url === 'string') {
    return {
      url: imageValue.url,
      alt: typeof imageValue.alt === 'string' ? imageValue.alt : undefined,
    }
  }
  if (typeof itemDoc.imageUrl === 'string') {
    return { url: itemDoc.imageUrl }
  }
  return undefined
}

const clampQuantityForItem = (itemDoc: Record<string, unknown>, requested: number): number => {
  if (!Number.isFinite(requested) || requested <= 0) return 0
  const limits: number[] = []
  const candidateKeys = [
    'maxPerOrder',
    'maxOrderQuantity',
    'maxQuantity',
    'maxPerCustomer',
    'maxPurchaseQuantity',
    'inventoryPerCustomer',
  ]
  for (const key of candidateKeys) {
    const raw = (itemDoc as Record<string, unknown>)[key]
    const value = Number(raw)
    if (Number.isFinite(value) && value > 0) {
      limits.push(Math.floor(value))
    }
  }
  if (typeof itemDoc.available === 'boolean' && itemDoc.available === false) {
    return 0
  }
  if (!limits.length) return Math.max(Math.floor(requested), 0)
  return Math.max(Math.min(Math.floor(requested), Math.min(...limits)), 0)
}

export const normalizeIncomingItems = (value: unknown): IncomingCartItem[] => {
  if (!Array.isArray(value)) return []
  const items: IncomingCartItem[] = []
  for (const raw of value) {
    if (!isRecord(raw)) continue
    const idCandidate = raw.id
    const quantityRaw = Number(raw.quantity)
    const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? Math.floor(quantityRaw) : 0
    if (quantity <= 0) continue
    if (typeof idCandidate === 'string' || typeof idCandidate === 'number') {
      items.push({ id: idCandidate, quantity })
    }
  }
  return items
}

export const buildQuantityMapFromIncoming = (items: IncomingCartItem[]): Map<number, number> => {
  const map = new Map<number, number>()
  for (const item of items) {
    const numericId = toItemId(item.id)
    if (numericId === null) continue
    const quantity = Math.max(0, Math.floor(item.quantity))
    if (quantity <= 0) continue
    map.set(numericId, (map.get(numericId) ?? 0) + quantity)
  }
  return map
}

export const extractCartQuantities = (doc: unknown): Map<number, number> => {
  const map = new Map<number, number>()
  if (!isRecord(doc)) return map
  const items = doc.items
  if (!Array.isArray(items)) return map
  for (const entry of items) {
    if (!isRecord(entry)) continue
    const itemId = toItemId(entry.item)
    const quantityRaw = Number(entry.quantity)
    const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? Math.floor(quantityRaw) : 0
    if (itemId === null || quantity <= 0) continue
    map.set(itemId, (map.get(itemId) ?? 0) + quantity)
  }
  return map
}

export const resolveCartPayload = async (
  payload: Payload,
  quantityMap: Map<number, number>,
): Promise<{
  lines: CartLine[]
  serialized: SerializedCartItem[]
  total: number
  snapshot: Record<string, number>
}> => {
  if (quantityMap.size === 0) {
    return { lines: [], serialized: [], total: 0, snapshot: {} }
  }

  const ids = Array.from(quantityMap.keys())
  const itemsResult = await payload.find({
    collection: 'items',
    where: {
      id: { in: ids },
    },
    depth: 2,
    limit: ids.length,
  })

  const itemsMap = new Map<number, Record<string, unknown>>()
  for (const item of itemsResult.docs) {
    if (!isRecord(item)) continue
    const numericId = toItemId(item.id)
    if (numericId === null) continue
    itemsMap.set(numericId, item)
  }

  const lines: CartLine[] = []
  const serialized: SerializedCartItem[] = []
  const snapshot: Record<string, number> = {}
  let total = 0

  for (const [itemId, requestedQuantity] of quantityMap.entries()) {
    const itemDoc = itemsMap.get(itemId)
    if (!itemDoc) continue
    const quantity = clampQuantityForItem(itemDoc, requestedQuantity)
    if (quantity <= 0) continue

    const priceRaw = Number(itemDoc.price)
    const price = Number.isFinite(priceRaw) && priceRaw >= 0 ? priceRaw : 0
    total += price * quantity

    lines.push({ item: itemId, quantity })
    const idRaw = itemDoc.id
    const id = typeof idRaw === 'string' ? idRaw : String(idRaw)

    serialized.push({
      id,
      name: typeof itemDoc.name === 'string' ? itemDoc.name : String(itemDoc.name ?? ''),
      price,
      quantity,
      category: pickCategoryName(itemDoc.category),
      image: pickImage(itemDoc),
    })

    snapshot[id] = quantity
  }

  return { lines, serialized, total, snapshot }
}

export const getDocId = (doc: unknown): number | string | null => {
  if (!isRecord(doc)) return null
  const { id } = doc
  if (typeof id === 'number' && Number.isFinite(id)) return id
  if (typeof id === 'string' && id.length > 0) return id
  return null
}

export const getSessionIdFromDoc = (doc: unknown): string | null => {
  if (!isRecord(doc)) return null
  const sid = doc.sessionId
  if (typeof sid === 'string' && sid.trim().length > 0) return sid
  return null
}

export const generateSessionId = (): string => {
  try {
    if (typeof globalThis.crypto?.randomUUID === 'function') {
      return globalThis.crypto.randomUUID()
    }
  } catch {}
  return Math.random().toString(36).slice(2)
}

export const findActiveCartForUser = async (
  payload: Payload,
  userId: number | string,
): Promise<Record<string, unknown> | null> => {
  const query = await payload.find({
    collection: 'abandoned-carts',
    overrideAccess: true,
    limit: 1,
    depth: 0,
    sort: '-updatedAt',
    where: {
      and: [{ user: { equals: userId } }, { status: { not_equals: 'recovered' } }],
    },
  })

  const doc = query?.docs?.[0]
  return isRecord(doc) ? doc : null
}

export const findCartBySession = async (
  payload: Payload,
  sessionId: string,
): Promise<Record<string, unknown> | null> => {
  const query = await payload.find({
    collection: 'abandoned-carts',
    overrideAccess: true,
    limit: 1,
    depth: 0,
    sort: '-updatedAt',
    where: {
      and: [{ sessionId: { equals: sessionId } }, { status: { not_equals: 'recovered' } }],
    },
  })

  const doc = query?.docs?.[0]
  return isRecord(doc) ? doc : null
}

export async function createNewCart(payload: Payload, userId?: number | string) {
  const cart = await payload.create({
    collection: 'abandoned-carts',
    data: {
      items: [],
      status: 'active',
      sessionId: Math.random().toString(36).slice(2), // Generate a simple session ID
      lastActivityAt: new Date().toISOString(),
      user: userId ? (userId as any) : null,
    },
  })

  return cart
}
