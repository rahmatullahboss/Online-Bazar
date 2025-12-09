import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

type IncomingItem = { id: string | number; quantity: number }

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: request.headers })

    const body = await request.json().catch(() => ({}))
    const normalizeString = (value: unknown) => {
      if (typeof value !== 'string') return undefined
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : undefined
    }

    const items: IncomingItem[] = Array.isArray(body?.items) ? body.items : []
    const total = typeof body?.total === 'number' ? Number(body.total) : undefined
    const customerEmail = normalizeString(body?.customerEmail)
    const customerName = normalizeString(body?.customerName)
    const customerNumber = normalizeString(body?.customerNumber)
    const isFinalUpdate = Boolean(body?.isFinalUpdate)
    const isPotentialAbandonment = Boolean(body?.isPotentialAbandonment)

    // Cart activity request received

    // Require at least one meaningful field
    if (!items.length && typeof total !== 'number') {
      return NextResponse.json({ error: 'No cart data' }, { status: 400 })
    }

    // Get or create a lightweight session id cookie
    let sid = request.cookies.get('dyad_cart_sid')?.value
    const isNewSID = !sid
    if (!sid) {
      try {
        sid = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)
      } catch {
        sid = Math.random().toString(36).slice(2)
      }
    }

    // Upsert by sessionId (ignore recovered carts)
    const existing = await payload.find({
      collection: 'abandoned-carts',
      limit: 1,
      where: {
        and: [{ sessionId: { equals: String(sid) } }, { status: { not_equals: 'recovered' } }],
      },
    })

    const now = new Date().toISOString()
    // Sanitize cart items: ensure numeric relationship IDs for Payload (default ID type: number)
    const sanitizedItems = items
      .filter(
        (it) =>
          (typeof it?.id === 'string' || typeof it?.id === 'number') && Number(it.quantity) > 0,
      )
      .map((it) => {
        let idNum: number | undefined
        if (typeof it.id === 'number' && Number.isFinite(it.id)) {
          idNum = it.id
        } else {
          const s = String(it.id).trim()
          if (/^\d+$/.test(s)) idNum = Number(s)
        }
        return idNum ? { item: idNum, quantity: Number(it.quantity) } : null
      })
      .filter((row): row is { item: number; quantity: number } => !!row)

    const isZeroCart = (typeof total === 'number' && total <= 0) || sanitizedItems.length === 0
    if (isZeroCart) {
      // Zero cart detected, deleting if exists
      if (existing?.docs?.[0]) {
        await payload.delete({
          collection: 'abandoned-carts',
          id: (existing.docs[0] as any).id,
        })
      }
      return NextResponse.json({ success: true })
    }

    // Pull profile fallbacks for logged-in users
    const userEmail = normalizeString(user ? (user as any)?.email : undefined)
    const userName = normalizeString(
      user
        ? `${String((user as any)?.firstName || '')} ${String((user as any)?.lastName || '')}`
        : undefined,
    )
    const userNumber = normalizeString(user ? (user as any)?.customerNumber : undefined)

    const hasContactInfo = Boolean(
      user || customerEmail || customerNumber || userEmail || userNumber,
    )

    if (!hasContactInfo) {
      // No contact info, deleting cart if exists
      if (existing?.docs?.[0]) {
        await payload.delete({
          collection: 'abandoned-carts',
          id: (existing.docs[0] as any).id,
        })
      }
      return NextResponse.json({ success: true })
    }

    const data: any = {
      sessionId: String(sid),
      ...(user ? { user: (user as any).id } : {}),
      // Prefer explicit payload; otherwise fall back to user profile
      ...(customerEmail || userEmail ? { customerEmail: customerEmail || userEmail } : {}),
      ...(customerName || userName ? { customerName: customerName || userName } : {}),
      ...(customerNumber || userNumber ? { customerNumber: customerNumber || userNumber } : {}),
      ...(sanitizedItems.length ? { items: sanitizedItems } : {}),
      ...(typeof total === 'number' ? { cartTotal: total } : {}),
      // If this is a final update or potential abandonment, mark as abandoned
      // Otherwise keep as active
      status: (isFinalUpdate || isPotentialAbandonment) ? 'abandoned' : 'active',
      lastActivityAt: now,
      reminderStage: 0,
    }

    // If this is a final update, we might want to mark it as potentially abandoned
    // depending on how long it's been since the last activity
    if (isFinalUpdate || isPotentialAbandonment) {
      // Add a note that this was a final update
      const note = isFinalUpdate
        ? 'Final update sent when user left the site'
        : 'Potential abandonment detected'

      data.notes = data.notes ? `${data.notes}\n${note}` : note
      // Marking cart as abandoned
    }

    let doc
    if (existing?.docs?.[0]) {
      // Updating existing cart
      doc = await payload.update({
        collection: 'abandoned-carts',
        id: (existing.docs[0] as any).id,
        data,
      })
    } else {
      // Creating new cart
      doc = await payload.create({ collection: 'abandoned-carts', data })
    }

    // Cart activity saved successfully

    const res = NextResponse.json({ success: true, id: (doc as any)?.id })
    if (isNewSID && sid) {
      res.cookies.set('dyad_cart_sid', String(sid), {
        path: '/',
        httpOnly: true,  // Security: prevent JS access to session cookie
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }
    return res
  } catch (e) {
    console.error('Cart activity error:', e)
    return NextResponse.json({ error: 'Failed to record cart activity' }, { status: 500 })
  }
}
