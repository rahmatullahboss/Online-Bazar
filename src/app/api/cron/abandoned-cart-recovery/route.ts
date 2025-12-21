import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import nodemailer from 'nodemailer'
import config from '@/payload.config'
import {
  generateAbandonedCartEmailHTML,
  generateAbandonedCartEmailText,
  getAbandonedCartEmailSubject,
  type AbandonedCartEmailData,
} from '@/lib/email-templates/abandoned-cart'

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Recovery timing for each stage (in minutes)
const REMINDER_TIMING = [
  30, // Stage 1: 30 minutes after abandonment
  120, // Stage 2: 2 hours after abandonment
  1440, // Stage 3: 24 hours after abandonment (with discount)
]

// Recovery discount for stage 3
const STAGE_3_DISCOUNT_PERCENT = 10
const STAGE_3_DISCOUNT_CODE = 'COMEBACK10'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret =
      request.headers.get('x-cron-secret') || request.nextUrl.searchParams.get('secret')

    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const now = new Date()

    // Find abandoned carts that need recovery emails
    const abandonedCarts = await payload.find({
      collection: 'abandoned-carts',
      where: {
        and: [
          { status: { equals: 'abandoned' } },
          { customerEmail: { exists: true } },
          { reminderStage: { less_than: 3 } }, // Max 3 reminders
          {
            or: [
              { recoveryEmailSentAt: { exists: false } },
              // Only send if enough time has passed since last email
              {
                recoveryEmailSentAt: {
                  less_than: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), // 1 hour gap minimum
                },
              },
            ],
          },
        ],
      },
      limit: 50, // Process max 50 carts per run
      depth: 2, // Get item details
    })

    const results = {
      processed: 0,
      emailsSent: 0,
      errors: [] as string[],
    }

    for (const cart of abandonedCarts.docs) {
      try {
        const currentStage = (cart.reminderStage || 0) + 1
        const lastActivityAt = new Date(cart.lastActivityAt as string)
        const minutesSinceAbandonment = (now.getTime() - lastActivityAt.getTime()) / (1000 * 60)

        // Check if it's time for this reminder stage
        const requiredMinutes = REMINDER_TIMING[currentStage - 1] || REMINDER_TIMING[0]
        if (minutesSinceAbandonment < requiredMinutes) {
          continue // Not time yet for this reminder
        }

        // Prepare cart items for email
        const cartItems: AbandonedCartEmailData['cartItems'] = []
        const items = cart.items as
          | Array<{
              item:
                | {
                    id: number
                    name: string
                    price: number
                    image?: { url: string }
                    imageUrl?: string
                  }
                | number
              quantity: number
            }>
          | undefined

        if (items && Array.isArray(items)) {
          for (const cartItem of items) {
            const item = cartItem.item
            if (typeof item === 'object' && item) {
              cartItems.push({
                name: item.name,
                price: item.price,
                quantity: cartItem.quantity,
                imageUrl: item.image?.url || item.imageUrl,
              })
            }
          }
        }

        if (cartItems.length === 0) {
          continue // No valid items to show
        }

        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
        const recoveryLink = `${serverUrl}/cart?session=${cart.sessionId}`

        const emailData: AbandonedCartEmailData = {
          customerName: (cart.customerName as string) || '',
          customerEmail: cart.customerEmail as string,
          cartItems,
          cartTotal: (cart.cartTotal as number) || 0,
          discountCode: currentStage >= 3 ? STAGE_3_DISCOUNT_CODE : undefined,
          discountPercent: currentStage >= 3 ? STAGE_3_DISCOUNT_PERCENT : undefined,
          recoveryLink,
          reminderStage: currentStage,
        }

        // Send email
        await transporter.sendMail({
          from: `"Online Bazar" <${process.env.GMAIL_USER}>`,
          to: cart.customerEmail as string,
          subject: getAbandonedCartEmailSubject(currentStage),
          html: generateAbandonedCartEmailHTML(emailData),
          text: generateAbandonedCartEmailText(emailData),
        })

        // Update cart with new reminder stage
        await payload.update({
          collection: 'abandoned-carts',
          id: cart.id,
          data: {
            reminderStage: currentStage,
            recoveryEmailSentAt: now.toISOString(),
          },
        })

        results.emailsSent++
        results.processed++

        payload.logger.info(`Sent recovery email stage ${currentStage} to ${cart.customerEmail}`)
      } catch (error) {
        results.errors.push(`Cart ${cart.id}: ${(error as Error).message}`)
        results.processed++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} abandoned carts, sent ${results.emailsSent} recovery emails`,
      ...results,
    })
  } catch (error) {
    console.error('Abandoned cart recovery error:', error)
    return NextResponse.json(
      { error: 'Failed to process abandoned cart recovery' },
      { status: 500 },
    )
  }
}

// GET endpoint for Vercel cron or manual trigger
export async function GET(request: NextRequest) {
  return POST(request)
}
