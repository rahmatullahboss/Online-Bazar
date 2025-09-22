import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

import type { AbandonedCart } from '@/payload-types'

import config from '@/payload.config'
import {
  buildQuantityMapFromIncoming,
  extractCartQuantities,
  findActiveCartForUser,
  findCartBySession,
  generateSessionId,
  getDocId,
  getSessionIdFromDoc,
  isRecord,
  normalizeIncomingItems,
  resolveCartPayload,
  resolveUserId,
} from '../cart-helpers'

const mergeQuantityMaps = (
  base: Map<number, number>,
  additions: Map<number, number>,
): Map<number, number> => {
  const next = new Map(base)
  for (const [id, quantity] of additions.entries()) {
    const existing = next.get(id) ?? 0
    next.set(id, existing + quantity)
  }
  return next
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = resolveUserId(user)
    if (typeof userId !== 'number' && typeof userId !== 'string') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const bodyRecord = isRecord(body) ? body : null
    const itemsInput = bodyRecord?.items ?? null
    const incomingItems = normalizeIncomingItems(itemsInput)
    const incomingMap = buildQuantityMapFromIncoming(incomingItems)

    const cookieSession = request.cookies.get('dyad_cart_sid')?.value
    const rawSessionId = bodyRecord?.sessionId
    const payloadSession =
      typeof rawSessionId === 'string' && rawSessionId.trim().length > 0
        ? rawSessionId.trim()
        : undefined

    const userCart = await findActiveCartForUser(payload, userId)
    const sessionIdCandidate = payloadSession || cookieSession
    const sessionCart = sessionIdCandidate
      ? await findCartBySession(payload, sessionIdCandidate)
      : null

    const userQuantityMap = new Map<number, number>()
    if (userCart) {
      const existing = extractCartQuantities(userCart)
      for (const [id, quantity] of existing.entries()) {
        userQuantityMap.set(id, (userQuantityMap.get(id) ?? 0) + quantity)
      }
    }

    const guestQuantityMap = new Map<number, number>()
    if (sessionCart && getDocId(sessionCart) !== getDocId(userCart)) {
      const sessionQuantities = extractCartQuantities(sessionCart)
      for (const [id, quantity] of sessionQuantities.entries()) {
        guestQuantityMap.set(id, quantity)
      }
    }

    if (incomingMap.size > 0) {
      for (const [id, quantity] of incomingMap.entries()) {
        const existing = guestQuantityMap.get(id) ?? 0
        guestQuantityMap.set(id, Math.max(existing, quantity))
      }
    }

    const mergedMap = mergeQuantityMaps(userQuantityMap, guestQuantityMap)
    const resolved = await resolveCartPayload(payload, mergedMap)

    const targetCartId = getDocId(userCart) ?? getDocId(sessionCart)
    const sourceSessionId =
      getSessionIdFromDoc(userCart) ?? getSessionIdFromDoc(sessionCart) ?? sessionIdCandidate
    const sessionId = sourceSessionId ?? generateSessionId()

    const nowIso = new Date().toISOString()

    const data: Omit<AbandonedCart, 'id' | 'createdAt' | 'updatedAt'> = {
      sessionId,
      user: userId as any,
      items: resolved.lines,
      cartTotal: resolved.total,
      status: 'active',
      lastActivityAt: nowIso,
      customerName: null,
      customerEmail: null,
      customerNumber: null,
      recoveredOrder: null,
      recoveryEmailSentAt: null,
      reminderStage: 0,
      notes: null,
    }

    if (targetCartId !== null) {
      await payload.update({ collection: 'abandoned-carts', id: targetCartId as any, data })
    } else {
      await payload.create({ collection: 'abandoned-carts', data })
    }

    if (userCart && sessionCart && getDocId(sessionCart) !== getDocId(userCart)) {
      const orphanId = getDocId(sessionCart)
      if (orphanId !== null) {
        try {
          await payload.delete({ collection: 'abandoned-carts', id: orphanId as any })
        } catch (error) {
          console.warn('Failed to remove guest cart after merge:', error)
        }
      }
    }

    const response = NextResponse.json({
      success: true,
      items: resolved.serialized,
      total: resolved.total,
      snapshot: resolved.snapshot,
      sessionId,
    })

    if (sessionId) {
      response.cookies.set('dyad_cart_sid', String(sessionId), {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      })
    }

    return response
  } catch (error) {
    console.error('Failed to merge carts:', error)
    return NextResponse.json({ error: 'Failed to merge carts' }, { status: 500 })
  }
}
