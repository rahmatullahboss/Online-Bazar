'use client'

import { useEffect, useRef } from 'react'

/**
 * Hook to detect when a user is about to leave the site and send a final cart activity update
 * This helps in more accurately marking carts as abandoned
 */
export function useCartAbandonmentTracking(items: any[], total: number, sessionId: string | null) {
  const hasSentFinalUpdate = useRef(false)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasActiveCart = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Only track if there are items in the cart and we have a session ID
    if (items.length === 0 || !sessionId) {
      // Clear any existing heartbeat if cart is now empty
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }
      hasActiveCart.current = false
      return
    }

    // Function to send heartbeat signal to keep cart active
    const sendHeartbeat = async () => {
      try {
        const response = await fetch('/api/abandoned-carts/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.warn('Heartbeat failed:', errorData.error || 'Unknown error')
          
          // If the cart is not found or not active, stop sending heartbeats
          if (response.status === 404 || response.status === 400) {
            if (heartbeatIntervalRef.current) {
              clearInterval(heartbeatIntervalRef.current)
              heartbeatIntervalRef.current = null
            }
          }
        } else {
          // Successfully sent heartbeat
          const result = await response.json()
          // If the cart is already abandoned, stop sending heartbeats
          if (result.status === 'abandoned') {
            if (heartbeatIntervalRef.current) {
              clearInterval(heartbeatIntervalRef.current)
              heartbeatIntervalRef.current = null
            }
          } else {
            hasActiveCart.current = true
          }
        }
      } catch (error) {
        console.error('Failed to send heartbeat:', error)
      }
    }

    // Send initial heartbeat only if we don't already have an active interval
    if (!heartbeatIntervalRef.current) {
      sendHeartbeat()
    }

    // Set up periodic heartbeat (every 5 minutes) if not already set
    if (!heartbeatIntervalRef.current) {
      heartbeatIntervalRef.current = setInterval(sendHeartbeat, 5 * 60 * 1000)
    }

    // Function to send final cart activity update
    const sendFinalUpdate = async () => {
      // Prevent multiple calls
      if (hasSentFinalUpdate.current) return
      hasSentFinalUpdate.current = true

      // Clear the heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }

      // Only send final update if we had an active cart
      if (!hasActiveCart.current) return

      try {
        // Try to include any known guest details
        let customerEmail: string | undefined
        let customerNumber: string | undefined
        let customerName: string | undefined

        try {
          customerEmail = localStorage.getItem('dyad-guest-email') || undefined
          customerNumber = localStorage.getItem('dyad-guest-number') || undefined
          const n = localStorage.getItem('dyad-guest-name') || undefined
          customerName = n && n.trim().length > 0 ? n : undefined
        } catch (e) {
          // Ignore localStorage errors
        }

        // Send a final cart activity update with a special flag
        await fetch('/api/cart-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((i: any) => ({ id: i.id, quantity: i.quantity })),
            total,
            customerEmail,
            customerNumber,
            customerName,
            isFinalUpdate: true, // Special flag to indicate this is a final update
            sessionId,
          }),
          // Use keepalive to ensure the request is sent even if the page is unloaded
          keepalive: true,
        })
      } catch (error) {
        console.error('Failed to send final cart activity update:', error)
      }
    }

    // Event listeners for different ways a user might leave the site
    const handleBeforeUnload = () => {
      sendFinalUpdate()
    }

    const handlePageHide = () => {
      sendFinalUpdate()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendFinalUpdate()
      }
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup function
    return () => {
      // Clear the heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }

      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [items, total, sessionId])
}

/**
 * Function to manually trigger cart abandonment tracking
 * Can be called when a user explicitly closes the cart or navigates away
 */
export async function markCartAsPotentiallyAbandoned(
  items: any[],
  total: number,
  sessionId: string | null,
) {
  if (items.length === 0 || !sessionId) return

  try {
    let customerEmail: string | undefined
    let customerNumber: string | undefined
    let customerName: string | undefined

    try {
      customerEmail = localStorage.getItem('dyad-guest-email') || undefined
      customerNumber = localStorage.getItem('dyad-guest-number') || undefined
      const n = localStorage.getItem('dyad-guest-name') || undefined
      customerName = n && n.trim().length > 0 ? n : undefined
    } catch (e) {
      // Ignore localStorage errors
    }

    await fetch('/api/cart-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((i: any) => ({ id: i.id, quantity: i.quantity })),
        total,
        customerEmail,
        customerNumber,
        customerName,
        isPotentialAbandonment: true,
        sessionId,
      }),
    })
  } catch (error) {
    console.error('Failed to mark cart as potentially abandoned:', error)
  }
}

/**
 * Function to manually trigger abandoned cart cleanup
 * This can be called by admin users or through MCP tools
 */
export async function cleanupAbandonedCarts(ttlMinutes: number = 30, secret?: string) {
  try {
    const url = new URL('/api/abandoned-carts/cleanup', window.location.origin)
    url.searchParams.set('ttlMinutes', ttlMinutes.toString())

    if (secret) {
      url.searchParams.set('secret', secret)
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Failed with status ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to cleanup abandoned carts:', error)
    throw error
  }
}
