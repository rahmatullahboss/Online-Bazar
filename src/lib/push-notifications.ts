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

interface NotificationPayload {
  title: string
  body: string
  url?: string
  icon?: string
}

/**
 * Send a push notification to a specific user
 */
export async function sendPushToUser(
  userId: number,
  notification: NotificationPayload,
): Promise<{ success: boolean; sent: number; failed: number }> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return { success: false, sent: 0, failed: 0 }
  }

  try {
    const payload = await getPayload({ config })

    // Get user's active subscriptions
    const subscriptions = await payload.find({
      collection: 'push-subscriptions',
      where: {
        user: {
          equals: userId,
        },
        isActive: {
          equals: true,
        },
      },
      limit: 10,
    })

    if (subscriptions.docs.length === 0) {
      return { success: true, sent: 0, failed: 0 }
    }

    const notificationPayload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      url: notification.url || '/',
      icon: notification.icon || '/icon.png',
      badge: '/favicon-48x48.png',
    })

    let sent = 0
    let failed = 0

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
          sent++
        } catch (error: any) {
          failed++

          // Mark expired subscriptions as inactive
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

    return { success: true, sent, failed }
  } catch {
    return { success: false, sent: 0, failed: 0 }
  }
}

/**
 * Send order status notification
 */
export async function sendOrderStatusNotification(
  userId: number,
  orderId: string,
  status: string,
): Promise<void> {
  const statusMessages: Record<string, { title: string; body: string }> = {
    pending: {
      title: '📦 Order Received!',
      body: 'Your order has been received and is being processed.',
    },
    processing: {
      title: '⏳ Order Processing',
      body: 'Your order is being prepared for shipping.',
    },
    shipped: {
      title: '🚚 Order Shipped!',
      body: 'Great news! Your order is on its way.',
    },
    delivered: {
      title: '✅ Order Delivered!',
      body: 'Your order has been delivered. Enjoy!',
    },
    cancelled: {
      title: '❌ Order Cancelled',
      body: 'Your order has been cancelled.',
    },
  }

  const message = statusMessages[status]
  if (!message) return

  await sendPushToUser(userId, {
    ...message,
    url: `/my-orders?order=${orderId}`,
  })
}
