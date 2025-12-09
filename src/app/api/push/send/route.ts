import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import webPush from 'web-push'

// Configure VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@online-bazar.top'

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

interface SendNotificationBody {
  userId?: number
  title: string
  body: string
  url?: string
  icon?: string
}

export async function POST(request: NextRequest) {
  try {
    // Verify VAPID keys are configured
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: 'Push notifications not configured - VAPID keys missing' },
        { status: 500 },
      )
    }

    const payload = await getPayload({ config })

    // Only admins can send push notifications
    const { user } = await payload.auth({ headers: request.headers })

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - admin only' }, { status: 403 })
    }

    const body: SendNotificationBody = await request.json()
    const { userId, title, body: notificationBody, url, icon } = body

    if (!title || !notificationBody) {
      return NextResponse.json({ error: 'Missing title or body' }, { status: 400 })
    }

    // Build query for subscriptions
    const subscriptionQuery: any = {
      isActive: {
        equals: true,
      },
    }

    // If userId specified, only send to that user
    if (userId) {
      subscriptionQuery.user = {
        equals: userId,
      }
    }

    // Get all active subscriptions
    const subscriptions = await payload.find({
      collection: 'push-subscriptions',
      where: subscriptionQuery,
      limit: 1000,
    })

    if (subscriptions.docs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active subscriptions found',
        sent: 0,
      })
    }

    const notificationPayload = JSON.stringify({
      title,
      body: notificationBody,
      url: url || '/',
      icon: icon || '/icon.png',
      badge: '/favicon-48x48.png',
    })

    let successCount = 0
    let failureCount = 0
    const failedEndpoints: string[] = []

    // Send to all subscriptions
    await Promise.all(
      subscriptions.docs.map(async (sub: any) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          }

          await webPush.sendNotification(pushSubscription, notificationPayload)
          successCount++
        } catch (error: any) {
          failureCount++
          failedEndpoints.push(sub.endpoint)

          // If subscription is expired or invalid, mark as inactive
          if (error.statusCode === 404 || error.statusCode === 410) {
            await payload.update({
              collection: 'push-subscriptions',
              id: sub.id,
              data: {
                isActive: false,
              },
            })
          }
        }
      }),
    )

    return NextResponse.json({
      success: true,
      message: `Sent ${successCount} notifications, ${failureCount} failed`,
      sent: successCount,
      failed: failureCount,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send notification'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
