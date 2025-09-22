'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

const statusConfig = {
  pending: {
    label: '⏳ Pending',
    color: '#f59e0b',
    background: '#fef3c7',
    bgHover: '#fde68a',
  },
  processing: {
    label: '🔄 Processing',
    color: '#3b82f6',
    background: '#dbeafe',
    bgHover: '#bfdbfe',
  },
  shipped: {
    label: '📦 Shipped',
    color: '#8b5cf6',
    background: '#e9d5ff',
    bgHover: '#ddd6fe',
  },
  completed: {
    label: '✅ Completed',
    color: '#10b981',
    background: '#d1fae5',
    bgHover: '#a7f3d0',
  },
  cancelled: {
    label: '❌ Cancelled',
    color: '#ef4444',
    background: '#fee2e2',
    bgHover: '#fecaca',
  },
  refunded: {
    label: '🔄 Refunded',
    color: '#6b7280',
    background: '#f3f4f6',
    bgHover: '#e5e7eb',
  },
}

interface OrderStatusDropdownProps {
  cellData: string
  rowData: {
    id: string | number
    [key: string]: any
  }
}

const OrderStatusDropdown: React.FC<OrderStatusDropdownProps> = ({ cellData, rowData }) => {
  const [currentStatus, setCurrentStatus] = useState(cellData as keyof typeof statusConfig)
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [isClient, setIsClient] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  const currentConfig = statusConfig[currentStatus] || statusConfig.pending

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

      setDropdownPosition({
        top: rect.bottom + scrollTop + 8,
        left: rect.left + scrollLeft,
      })
    }
  }, [isOpen])

  const updateOrderStatus = async (newStatus: string) => {
    if (newStatus === currentStatus || isUpdating) return

    setIsUpdating(true)
    setIsOpen(false) // Close dropdown immediately

    try {
      const response = await fetch('/api/orders/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: rowData.id,
          status: newStatus,
        }),
      })

      const responseData = await response.json()

      if (response.ok) {
        setCurrentStatus(newStatus as keyof typeof statusConfig)

        // Show success message
        const event = new CustomEvent('order-status-updated', {
          detail: {
            orderId: rowData.id,
            newStatus,
            success: true,
            message: `Order status updated successfully to ${newStatus}`,
          },
        })
        window.dispatchEvent(event)

        // Refresh the page data after a short delay
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        throw new Error(responseData.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)

      // Revert status on error
      const event = new CustomEvent('order-status-updated', {
        detail: {
          orderId: rowData.id,
          newStatus,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      })
      window.dispatchEvent(event)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Current Status Display */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          color: currentConfig.color,
          background: isUpdating ? '#f3f4f6' : currentConfig.background,
          border: `1px solid ${currentConfig.color}40`,
          cursor: isUpdating ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s ease',
          opacity: isUpdating ? 0.7 : 1,
          minWidth: '120px',
          justifyContent: 'center',
          gap: '6px',
        }}
        onMouseEnter={(e) => {
          if (!isUpdating) {
            e.currentTarget.style.background = currentConfig.bgHover
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = `0 4px 8px ${currentConfig.color}20`
          }
        }}
        onMouseLeave={(e) => {
          if (!isUpdating) {
            e.currentTarget.style.background = currentConfig.background
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }
        }}
      >
        {isUpdating ? (
          <>
            <span
              style={{
                width: '12px',
                height: '12px',
                border: `2px solid ${currentConfig.color}30`,
                borderTop: `2px solid ${currentConfig.color}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            Updating...
          </>
        ) : (
          <>
            {currentConfig.label}
            <span
              style={{
                fontSize: '8px',
                marginLeft: '4px',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              ▼
            </span>
          </>
        )}
      </button>

      {/* Dropdown Menu via Portal */}
      {isOpen &&
        !isUpdating &&
        isClient &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999998,
                backgroundColor: 'transparent',
              }}
              onClick={() => setIsOpen(false)}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsOpen(false)
              }}
            />

            {/* Dropdown */}
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                zIndex: 999999,
                overflow: 'hidden',
                minWidth: '200px',
                maxWidth: '250px',
                whiteSpace: 'nowrap',
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              {Object.entries(statusConfig).map(([status, config]) => (
                <button
                  key={status}
                  onClick={() => updateOrderStatus(status)}
                  disabled={status === currentStatus}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    background: status === currentStatus ? config.background : 'transparent',
                    color: config.color,
                    fontSize: '13px',
                    fontWeight: status === currentStatus ? '600' : '500',
                    cursor: status === currentStatus ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: status === currentStatus ? 0.7 : 1,
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    if (status !== currentStatus) {
                      e.currentTarget.style.background = config.background
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (status !== currentStatus) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: config.color,
                      flexShrink: 0,
                    }}
                  />
                  {config.label}
                  {status === currentStatus && (
                    <span style={{ marginLeft: 'auto', fontSize: '10px' }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}

      {/* CSS Animation for spinner */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

export default OrderStatusDropdown
