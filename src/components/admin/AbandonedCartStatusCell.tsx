'use client'

import React from 'react'

// Status configuration with color coding
const statusConfig = {
  active: {
    label: 'Active',
    color: '#f59e0b', // orange
    background: '#fef3c7'
  },
  abandoned: {
    label: 'Abandoned',
    color: '#ef4444', // red
    background: '#fee2e2'
  },
  recovered: {
    label: 'Recovered',
    color: '#10b981', // green
    background: '#d1fae5'
  }
}

const AbandonedCartStatusCell: React.FC<{ cellData: any }> = ({ cellData }) => {
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

export default AbandonedCartStatusCell