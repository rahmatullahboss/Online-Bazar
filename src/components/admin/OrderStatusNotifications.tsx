'use client'

import React, { useEffect, useState } from 'react'

interface NotificationProps {
  id: string
  type: 'success' | 'error'
  message: string
  orderId: string | number
  onClose: () => void
}

const Notification: React.FC<NotificationProps> = ({ type, message, orderId, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'success' ? '#10b981' : '#ef4444'
  const icon = type === 'success' ? '✅' : '❌'

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'white',
        border: `2px solid ${bgColor}`,
        borderRadius: '12px',
        padding: '16px 20px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        zIndex: 10000,
        minWidth: '320px',
        maxWidth: '450px',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: '600', 
            color: bgColor, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Order #{orderId} Status {type === 'success' ? 'Updated' : 'Update Failed'}
          </div>
          <div style={{ 
            color: '#6b7280', 
            fontSize: '13px'
          }}>
            {message}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            color: '#9ca3af',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1
          }}
        >
          ×
        </button>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

const OrderStatusNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'success' | 'error'
    message: string
    orderId: string | number
  }>>([])

  useEffect(() => {
    const handleStatusUpdate = (event: CustomEvent) => {
      const { orderId, newStatus, success, error } = event.detail

      const id = `${orderId}-${Date.now()}`
      
      if (success) {
        const statusLabels: Record<string, string> = {
          pending: '⏳ Pending',
          processing: '🔄 Processing', 
          shipped: '📦 Shipped',
          completed: '✅ Completed',
          cancelled: '❌ Cancelled',
          refunded: '🔄 Refunded'
        }

        setNotifications(prev => [...prev, {
          id,
          type: 'success',
          message: `Status changed to ${statusLabels[newStatus] || newStatus}. Customer has been notified via email.`,
          orderId
        }])
      } else {
        setNotifications(prev => [...prev, {
          id,
          type: 'error',
          message: error?.message || 'Failed to update order status. Please try again.',
          orderId
        }])
      }
    }

    window.addEventListener('order-status-updated', handleStatusUpdate as EventListener)
    
    return () => {
      window.removeEventListener('order-status-updated', handleStatusUpdate as EventListener)
    }
  }, [])

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  return (
    <>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  )
}

export default OrderStatusNotifications