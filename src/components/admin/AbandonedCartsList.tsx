'use client'

import React, { useState, useEffect } from 'react'

// Status configuration with color coding
const statusConfig = {
  active: {
    label: '🟢 Active',
    color: '#10b981',
    background: '#d1fae5'
  },
  abandoned: {
    label: '🔴 Abandoned',
    color: '#ef4444',
    background: '#fee2e2'
  },
  recovered: {
    label: '🔵 Recovered',
    color: '#3b82f6',
    background: '#dbeafe'
  }
}

const AbandonedCartsList: React.FC<{ collection: any; data: any[] }> = ({ collection, data }) => {
  const [showRecovered, setShowRecovered] = useState(false)
  const [filteredData, setFilteredData] = useState<any[]>([])

  // Filter data based on showRecovered state
  useEffect(() => {
    if (showRecovered) {
      setFilteredData(data)
    } else {
      setFilteredData(data.filter((item: any) => item.status !== 'recovered'))
    }
  }, [data, showRecovered])

  // Status badge component
  const StatusBadge: React.FC<{ status: keyof typeof statusConfig }> = ({ status }) => {
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

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Control bar */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          padding: '12px 16px',
          background: 'var(--theme-elevation-100)',
          borderRadius: '8px',
          border: '1px solid var(--theme-elevation-200)'
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            Abandoned Carts ({filteredData.length} items)
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--theme-text-500)' }}>
            {showRecovered 
              ? 'Showing all carts including recovered ones' 
              : 'Recovered carts are hidden by default'}
          </p>
        </div>
        
        <button
          onClick={() => setShowRecovered(!showRecovered)}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid var(--theme-elevation-400)',
            background: 'var(--theme-elevation-0)',
            color: 'var(--theme-text-800)',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--theme-elevation-100)'
            e.currentTarget.style.borderColor = 'var(--theme-elevation-500)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--theme-elevation-0)'
            e.currentTarget.style.borderColor = 'var(--theme-elevation-400)'
          }}
        >
          {showRecovered ? 'Hide Recovered Carts' : 'Show Recovered Carts'}
        </button>
      </div>

      {/* Stats summary */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <div 
          style={{ 
            padding: '12px', 
            borderRadius: '8px', 
            background: statusConfig.active.background,
            border: `1px solid ${statusConfig.active.color}30`
          }}
        >
          <div style={{ fontSize: '12px', color: statusConfig.active.color, marginBottom: '4px' }}>
            Active Carts
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: statusConfig.active.color }}>
            {data.filter((item: any) => item.status === 'active').length}
          </div>
        </div>
        
        <div 
          style={{ 
            padding: '12px', 
            borderRadius: '8px', 
            background: statusConfig.abandoned.background,
            border: `1px solid ${statusConfig.abandoned.color}30`
          }}
        >
          <div style={{ fontSize: '12px', color: statusConfig.abandoned.color, marginBottom: '4px' }}>
            Abandoned Carts
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: statusConfig.abandoned.color }}>
            {data.filter((item: any) => item.status === 'abandoned').length}
          </div>
        </div>
        
        <div 
          style={{ 
            padding: '12px', 
            borderRadius: '8px', 
            background: statusConfig.recovered.background,
            border: `1px solid ${statusConfig.recovered.color}30`
          }}
        >
          <div style={{ fontSize: '12px', color: statusConfig.recovered.color, marginBottom: '4px' }}>
            Recovered Carts
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: statusConfig.recovered.color }}>
            {data.filter((item: any) => item.status === 'recovered').length}
          </div>
        </div>
      </div>

      {/* List of carts */}
      <div>
        {filteredData.length === 0 ? (
          <div 
            style={{ 
              textAlign: 'center', 
              padding: '40px 20px', 
              color: 'var(--theme-text-500)',
              border: '1px dashed var(--theme-elevation-300)',
              borderRadius: '8px'
            }}
          >
            <p>No carts found</p>
            {!showRecovered && (
              <button
                onClick={() => setShowRecovered(true)}
                style={{
                  marginTop: '12px',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--theme-elevation-400)',
                  background: 'var(--theme-elevation-0)',
                  color: 'var(--theme-text-800)',
                  cursor: 'pointer'
                }}
              >
                Show Recovered Carts
              </button>
            )}
          </div>
        ) : (
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '16px' 
            }}
          >
            {filteredData.map((item: any) => (
              <div
                key={item.id}
                style={{
                  border: '1px solid var(--theme-elevation-200)',
                  borderRadius: '8px',
                  padding: '16px',
                  background: 'var(--theme-elevation-0)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                      {item.customerName || item.customerEmail || 'Anonymous User'}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--theme-text-500)' }}>
                      {item.sessionId}
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                    <strong>Cart Total:</strong> ৳{item.cartTotal || 0}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--theme-text-500)' }}>
                    <strong>Last Activity:</strong> {new Date(item.lastActivityAt).toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--theme-text-500)', marginBottom: '4px' }}>
                    <strong>Items:</strong> {item.items?.length || 0}
                  </div>
                  {item.recoveredOrder && (
                    <div style={{ fontSize: '13px', color: 'var(--theme-text-500)' }}>
                      <strong>Recovered Order:</strong> {item.recoveredOrder}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AbandonedCartsList