'use client'

import React from 'react'

const statusOptions = [
  { 
    label: '⏳ Pending', 
    value: 'pending',
    color: '#f59e0b'
  },
  { 
    label: '🔄 Processing', 
    value: 'processing',
    color: '#3b82f6'
  },
  { 
    label: '📦 Shipped', 
    value: 'shipped',
    color: '#8b5cf6'
  },
  { 
    label: '✅ Completed', 
    value: 'completed',
    color: '#10b981'
  },
  { 
    label: '❌ Cancelled', 
    value: 'cancelled',
    color: '#ef4444'
  },
  { 
    label: '🔄 Refunded', 
    value: 'refunded',
    color: '#6b7280'
  }
]

const OrderStatusSelect: React.FC<{ field?: any; value?: any; setValue?: any; readOnly?: boolean }> = (props) => {
  const { field, value, setValue, readOnly } = props
  const currentStatus = statusOptions.find(option => option.value === value)

  if (readOnly) {
    return (
      <div 
        style={{
          padding: '10px 12px',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          background: '#f9fafb',
          color: currentStatus?.color || '#374151',
          fontWeight: '600',
          fontSize: '14px'
        }}
      >
        {currentStatus?.label || value || 'No status'}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value || 'pending'}
        onChange={(e) => setValue(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          background: 'white',
          color: '#374151',
          fontWeight: '500',
          cursor: 'pointer'
        }}
      >
        {statusOptions.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Status color indicator */}
      <div 
        style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: currentStatus?.color || '#6b7280',
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}

export default OrderStatusSelect
