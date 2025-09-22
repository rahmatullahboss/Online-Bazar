'use client'

import React from 'react'

const statusConfig = {
  pending: {
    label: '⏳ Pending',
    color: '#f59e0b',
    background: '#fef3c7'
  },
  processing: {
    label: '🔄 Processing',
    color: '#3b82f6',
    background: '#dbeafe'
  },
  shipped: {
    label: '📦 Shipped',
    color: '#8b5cf6',
    background: '#e9d5ff'
  },
  completed: {
    label: '✅ Completed',
    color: '#10b981',
    background: '#d1fae5'
  },
  cancelled: {
    label: '❌ Cancelled',
    color: '#ef4444',
    background: '#fee2e2'
  },
  refunded: {
    label: '🔄 Refunded',
    color: '#6b7280',
    background: '#f3f4f6'
  }
}

const OrderStatusCell: React.FC<{ cellData: any }> = ({ cellData }) => {
  const status = cellData as keyof typeof statusConfig
  const config = statusConfig[status]

  if (!config) {
    return <span style={{ color: '#6b7280', fontSize: '14px' }}>Unknown</span>
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        color: config.color,
        background: config.background,
        border: `1px solid ${config.color}20`,
        whiteSpace: 'nowrap'
      }}
    >
      {config.label}
    </div>
  )
}

export default OrderStatusCell