// Custom service worker for push notifications
// This file is loaded by the PWA service worker

self.addEventListener('push', function (event) {
  if (!event.data) return

  try {
    const data = event.data.json()

    const options = {
      body: data.body || 'You have a new notification',
      icon: data.icon || '/icon.png',
      badge: data.badge || '/favicon-48x48.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        dateOfArrival: Date.now(),
      },
      actions: [
        {
          action: 'open',
          title: 'Open',
        },
        {
          action: 'close',
          title: 'Dismiss',
        },
      ],
      tag: data.tag || 'online-bazar-notification',
      renotify: true,
      requireInteraction: false,
    }

    event.waitUntil(self.registration.showNotification(data.title || 'Online Bazar', options))
  } catch {
    // Fallback for plain text
    const title = 'Online Bazar'
    const options = {
      body: event.data.text(),
      icon: '/icon.png',
      badge: '/favicon-48x48.png',
    }

    event.waitUntil(self.registration.showNotification(title, options))
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  // Get the URL from notification data
  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          if ('navigate' in client) {
            return client.navigate(urlToOpen)
          }
          return
        }
      }

      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    }),
  )
})

// Handle subscription change (e.g., browser refreshes subscription)
self.addEventListener('pushsubscriptionchange', function (event) {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: self.VAPID_PUBLIC_KEY,
      })
      .then(function (subscription) {
        // Re-subscribe on server
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subscription }),
          credentials: 'include',
        })
      }),
  )
})
