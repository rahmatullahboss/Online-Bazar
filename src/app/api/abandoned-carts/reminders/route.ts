import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

import type { AbandonedCart } from '@/payload-types'

import config from '@/payload.config'

const HOUR_IN_MS = 60 * 60 * 1000

const STAGE_CONFIGS = [
  {
    stage: 1,
    waitHours: 24,
    minHoursSinceLastReminder: 0,
    subject: 'আপনার কার্টে থাকা পণ্যগুলো অপেক্ষায় আছে',
    headline: 'আপনার পছন্দের পণ্যগুলো এখনও সংরক্ষিত আছে।',
    intro:
      'আপনি আমাদের স্টোরে কিছু পণ্য কার্টে যোগ করেছিলেন কিন্তু অর্ডার সম্পন্ন করতে পারেননি। চিন্তা নেই, আমরা এগুলো এখনও আপনার জন্য ধরে রেখেছি।',
    followUp: 'মাত্র এক ক্লিকে এখনই ফিরে এসে অর্ডার নিশ্চিত করুন।',
  },
  {
    stage: 2,
    waitHours: 48,
    minHoursSinceLastReminder: 24,
    subject: 'দ্বিতীয় রিমাইন্ডার: আপনার কার্টে থাকা পণ্যগুলো মিস করবেন না',
    headline: 'দুই দিন হয়ে গেল — পণ্যগুলো এখনও আপনার জন্য অপেক্ষায়।',
    intro:
      'আপনার কার্টে থাকা পণ্যগুলো দ্রুত শেষ হয়ে যেতে পারে। যদি এখনও আগ্রহী থাকেন, এখনই অর্ডার করে নিশ্চিত করুন।',
    followUp: 'আপনার কার্ট পুনরুদ্ধার করুন এবং অর্ডার সম্পন্ন করুন।',
  },
  {
    stage: 3,
    waitHours: 72,
    minHoursSinceLastReminder: 24,
    subject: 'শেষ রিমাইন্ডার: পণ্যগুলো চলে যেতে পারে',
    headline: 'এই হলো আপনার শেষ সুযোগ — স্টক শেষ হওয়ার আগেই অর্ডার করুন।',
    intro:
      'তিন দিন আগে আপনি যেসব পণ্য কার্টে রেখেছিলেন আমরা সেগুলো ধরে রেখেছি। আর দেরি হলে পণ্যগুলো অন্য কেউ নিয়ে নিতে পারে।',
    followUp: 'আজই অর্ডার সম্পন্ন করুন এবং অফারটি উপভোগ করুন।',
  },
] as const

type StageConfig = (typeof STAGE_CONFIGS)[number]

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      case "'":
        return '&#39;'
      default:
        return char
    }
  })

const formatCurrency = (value?: number | null): string => {
  const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0
  return `৳${amount.toFixed(2)}`
}

const resolveServerURL = (payloadInstance: Awaited<ReturnType<typeof getPayload>> | null): string => {
  const fromConfig = (payloadInstance?.config as any)?.serverURL
  const envURL = process.env.NEXT_PUBLIC_SERVER_URL
  const raw = typeof fromConfig === 'string' && fromConfig.length > 0 ? fromConfig : envURL
  if (!raw) return ''
  return raw.endsWith('/') ? raw.slice(0, -1) : raw
}

const normalizeReminderStage = (cart: AbandonedCart | Record<string, unknown>): number => {
  const raw = (cart as any)?.reminderStage
  const parsed = typeof raw === 'number' && Number.isFinite(raw) ? raw : 0
  return Math.max(0, Math.min(parsed, 3))
}

const hasValidEmail = (cart: AbandonedCart | Record<string, unknown>): cart is AbandonedCart => {
  const email = (cart as any)?.customerEmail
  if (typeof email !== 'string') return false
  const trimmed = email.trim()
  if (!trimmed) return false
  return trimmed.includes('@')
}

const buildEmailContent = (
  cart: AbandonedCart,
  stage: StageConfig,
  serverURL: string,
): { html: string; text: string } => {
  const customerName =
    (typeof cart.customerName === 'string' && cart.customerName.trim().length > 0
      ? cart.customerName.trim()
      : null) ||
    (typeof cart.customerEmail === 'string' ? cart.customerEmail.split('@')[0] : 'গ্রাহক')

  const checkoutUrl = serverURL ? `${serverURL}/checkout` : ''
  const items = Array.isArray(cart.items) ? cart.items : []

  type DetailedItem = {
    name: string
    quantity: number
    unitPrice?: number
    lineTotal?: number
  }

  const detailedItems: DetailedItem[] = items
    .map((entry) => {
      const quantityRaw = Number((entry as any)?.quantity)
      const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? Math.floor(quantityRaw) : 0
      if (quantity <= 0) return null
      const itemRef = (entry as any)?.item
      let name = 'পণ্য'
      let unitPrice: number | undefined
      if (itemRef && typeof itemRef === 'object') {
        const maybeName = (itemRef as any)?.name
        const maybePrice = (itemRef as any)?.price
        if (typeof maybeName === 'string' && maybeName.trim()) {
          name = maybeName.trim()
        }
        if (typeof maybePrice === 'number' && Number.isFinite(maybePrice)) {
          unitPrice = maybePrice
        }
      } else if (typeof itemRef === 'number') {
        name = `পণ্য #${itemRef}`
      } else if (typeof itemRef === 'string') {
        name = itemRef
      }
      const detailedItem: DetailedItem = {
        name,
        quantity,
      }

      if (typeof unitPrice === 'number') {
        detailedItem.unitPrice = unitPrice
        const lineTotal = unitPrice * quantity
        if (Number.isFinite(lineTotal) && lineTotal > 0) {
          detailedItem.lineTotal = lineTotal
        }
      }

      return detailedItem
    })
    .filter((entry): entry is DetailedItem => entry !== null)

  const fallbackTotal = typeof cart.cartTotal === 'number' ? cart.cartTotal : undefined
  const computedTotal = detailedItems.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0)
  const totalValue = computedTotal > 0 ? computedTotal : fallbackTotal ?? 0

  const itemRowsHTML = detailedItems
    .map((item) => {
      const quantityLabel = `${item.quantity}`
      const priceLabel =
        typeof item.lineTotal === 'number' && item.lineTotal > 0
          ? formatCurrency(item.lineTotal)
          : item.unitPrice
            ? formatCurrency(item.unitPrice * item.quantity)
            : `${item.quantity} pcs`
      return `
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(item.name)}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;">${escapeHtml(quantityLabel)}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${escapeHtml(priceLabel)}</td>
        </tr>
      `
    })
    .join('')

  const itemRowsText = detailedItems
    .map((item) => {
      const priceLabel =
        typeof item.lineTotal === 'number' && item.lineTotal > 0
          ? formatCurrency(item.lineTotal)
          : item.unitPrice
            ? formatCurrency(item.unitPrice * item.quantity)
            : `${item.quantity} pcs`
      return `- ${item.name} × ${item.quantity} = ${priceLabel}`
    })
    .join('\n')

  const totalLabel = formatCurrency(totalValue)

  const greeting = `হ্যালো ${customerName},`

  const ctaButton = checkoutUrl
    ? `
        <p style="margin:24px 0;">
          <a href="${checkoutUrl}" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
            অর্ডার সম্পন্ন করুন
          </a>
        </p>
      `
    : ''

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
      <p>${escapeHtml(greeting)}</p>
      <h2 style="font-size:18px;margin:16px 0 8px 0;">${escapeHtml(stage.headline)}</h2>
      <p style="margin:8px 0;">${escapeHtml(stage.intro)}</p>
      <p style="margin:8px 0;">${escapeHtml(stage.followUp)}</p>
      ${itemRowsHTML
        ? `
            <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e5e7eb;width:100%;max-width:520px;margin:16px 0;">
              <thead>
                <tr>
                  <th align="left" style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;">পণ্য</th>
                  <th align="center" style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;">পরিমাণ</th>
                  <th align="right" style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;">মূল্য</th>
                </tr>
              </thead>
              <tbody>${itemRowsHTML}</tbody>
            </table>
          `
        : ''}
      <p style="margin:8px 0;font-weight:600;">মোট মূল্য: ${escapeHtml(totalLabel)}</p>
      ${ctaButton}
      <p style="margin:8px 0;">অর্ডার সম্পন্ন করার জন্য আপনার পূর্বের তথ্য আমরা সংরক্ষণ করে রেখেছি। শুধু লগইন করুন এবং পেমেন্ট নিশ্চিত করুন।</p>
      <p style="margin:16px 0 0 0;">শুভেচ্ছান্তে,<br/>Portal Mini Store টিম</p>
    </div>
  `

  const textParts = [
    greeting,
    '',
    stage.headline,
    stage.intro,
    stage.followUp,
    '',
    itemRowsText,
    '',
    `মোট মূল্য: ${totalLabel}`,
    checkoutUrl ? `অর্ডার সম্পন্ন করুন: ${checkoutUrl}` : '',
    '',
    'শুভেচ্ছান্তে,',
    'Portal Mini Store টিম',
  ].filter(Boolean)

  return { html, text: textParts.join('\n') }
}

const shouldSendForStage = (cart: AbandonedCart, stage: StageConfig, now: number): boolean => {
  if (!hasValidEmail(cart)) return false
  const reminderStage = normalizeReminderStage(cart)
  if (stage.stage === 1) {
    return reminderStage <= 0
  }
  if (reminderStage !== stage.stage - 1) {
    return false
  }
  const lastReminderAt = cart.recoveryEmailSentAt ? Date.parse(cart.recoveryEmailSentAt) : NaN
  if (!Number.isFinite(lastReminderAt)) {
    return false
  }
  const minGapMs = stage.minHoursSinceLastReminder * HOUR_IN_MS
  return now - lastReminderAt >= minGapMs
}

const runReminderJob = async (payloadInstance: Awaited<ReturnType<typeof getPayload>>) => {
  const results: Array<{
    stage: number
    attempted: number
    sent: number
    errors: number
  }> = []

  const now = Date.now()
  const serverURL = resolveServerURL(payloadInstance)

  for (const stage of STAGE_CONFIGS) {
    const cutoff = new Date(now - stage.waitHours * HOUR_IN_MS).toISOString()
    const query = await payloadInstance.find({
      collection: 'abandoned-carts',
      depth: 2,
      limit: 250,
      sort: 'lastActivityAt',
      where: {
        and: [
          { status: { not_equals: 'recovered' } },
          { lastActivityAt: { less_than: cutoff } },
        ],
      },
    })

    const stageResult = { stage: stage.stage, attempted: 0, sent: 0, errors: 0 }

    for (const raw of query.docs as AbandonedCart[]) {
      if (!raw) continue
      if (!shouldSendForStage(raw, stage, now)) continue

      stageResult.attempted += 1

      try {
        const { html, text } = buildEmailContent(raw, stage, serverURL)
        await payloadInstance.sendEmail?.({
          to: String(raw.customerEmail),
          subject: stage.subject,
          html,
          text,
        })

        await payloadInstance.update({
          collection: 'abandoned-carts',
          id: (raw as any).id,
          data: {
            reminderStage: stage.stage,
            recoveryEmailSentAt: new Date(now).toISOString(),
            status: raw.status === 'active' ? 'abandoned' : raw.status,
          },
        })

        stageResult.sent += 1
      } catch (error) {
        console.error(`Failed to send reminder for cart ${String((raw as any).id)}:`, error)
        stageResult.errors += 1
      }
    }

    results.push(stageResult)
  }

  return { results }
}

const ensureEmailSupport = (payloadInstance: Awaited<ReturnType<typeof getPayload>>) => {
  if (typeof payloadInstance?.sendEmail !== 'function') {
    throw new Error('Email transport is not configured for Payload')
  }
}

const handleCronAuthorization = (request: NextRequest) => {
  const isVercelCron = !!request.headers.get('x-vercel-cron')
  const url = new URL(request.url)
  const providedSecret = url.searchParams.get('secret') || request.headers.get('x-cron-secret')
  const hasSecret = !!process.env.CRON_SECRET && providedSecret === process.env.CRON_SECRET
  return { authorized: isVercelCron || hasSecret, via: isVercelCron ? 'vercel-cron' : hasSecret ? 'secret' : 'unknown' }
}

export async function GET(request: NextRequest) {
  try {
    const { authorized, via } = handleCronAuthorization(request)
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payloadInstance = await getPayload({ config: await config })
    ensureEmailSupport(payloadInstance)

    const outcome = await runReminderJob(payloadInstance)
    return NextResponse.json({ success: true, via, ...outcome })
  } catch (error) {
    console.error('Failed to process abandoned cart reminders:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payloadInstance = await getPayload({ config: await config })
    const { user } = await payloadInstance.auth({ headers: request.headers })

    if (!user || (user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    ensureEmailSupport(payloadInstance)

    const outcome = await runReminderJob(payloadInstance)
    return NextResponse.json({ success: true, via: 'admin', ...outcome })
  } catch (error) {
    console.error('Failed to process abandoned cart reminders (admin):', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}
