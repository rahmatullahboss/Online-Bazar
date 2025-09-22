'use client'

import React, { useEffect } from 'react'
import OrderStatusNotifications from './OrderStatusNotifications'

// This component will be injected globally in Payload admin
const GlobalNotificationProvider: React.FC = () => {
  useEffect(() => {
    // Add notification container to body if it doesn't exist
    let notificationContainer = document.getElementById('order-status-notifications')
    if (!notificationContainer) {
      notificationContainer = document.createElement('div')
      notificationContainer.id = 'order-status-notifications'
      notificationContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10000;
      `
      document.body.appendChild(notificationContainer)
    }

    // Mount notification system
    const script = document.createElement('script')
    script.innerHTML = `
      if (!window.__orderNotificationsMounted) {
        window.__orderNotificationsMounted = true;
        console.log('Order status notifications system loaded');
      }
    `
    document.head.appendChild(script)

    return () => {
      // Cleanup if needed
      if (notificationContainer && notificationContainer.parentNode) {
        notificationContainer.parentNode.removeChild(notificationContainer)
      }
    }
  }, [])

  return <OrderStatusNotifications />
}

export default GlobalNotificationProvider