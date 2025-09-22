'use client'
import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import GlobalNotificationProvider from '../admin/GlobalNotificationProvider'
import SalesReport from './sales-report'
import './index.scss'

type Metrics = {
  range: string
  from: string
  to: string
  totals: {
    grossSales: number
    totalOrders: number
    activeOrders: number
    fulfilledOrders: number
    cancelledOrders: number
    avgOrderValue?: number
    conversionRate?: number
  }
  salesSeries: { month: string; value: number }[]
  breakdown: {
    grossSales: number
    discounts: number
    returns: number
    deliveryCharge: number
    subtotal: number
    shipping: number
  }
  users?: { newUsers: number }
  devices?: { mobile: number; desktop: number; tablet: number; other: number }
}

const formatBDT = (n: number) => `৳${n.toFixed(2)}`

const cardStyle: React.CSSProperties = {
  background: 'var(--theme-elevation-0, #fff)',
  border: '1px solid var(--theme-elevation-200, #e5e7eb)',
  borderRadius: 8,
  padding: 12,
}

const smallText: React.CSSProperties = { fontSize: 12, color: 'var(--theme-text-400, #6b7280)' }
const bigText: React.CSSProperties = { fontSize: 22, fontWeight: 700 }

function Card({
  title,
  value,
  color,
  description,
}: {
  title: string
  value: string
  color?: string
  description?: string
}) {
  return (
    <div style={cardStyle}>
      <div style={smallText}>{title}</div>
      <div style={{ ...bigText, color: color || 'inherit', marginTop: 4 }}>{value}</div>
      {description && (
        <div style={{ ...smallText, marginTop: 4, fontStyle: 'italic' }}>{description}</div>
      )}
    </div>
  )
}

const Spark = ({ data }: { data: number[] }) => {
  const height = 120
  const width = 600
  const max = Math.max(1, ...data)
  const points = data
    .map((v, i) => {
      const x = (i / Math.max(1, data.length - 1)) * width
      const y = height - (v / max) * height
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline fill="none" stroke="#3b82f6" strokeWidth={2} points={points} />
    </svg>
  )
}

export default function BeforeDashboard() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [range, setRange] = useState<'this-month' | 'all-time'>('this-month')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    let isMounted = true
    setLoading(true)
    fetch(`/api/admin/metrics?range=${range}`)
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!isMounted) return
        if (!ok) throw new Error(j?.error || 'Failed to load metrics')
        setMetrics(j as Metrics)
        setErr(null)
      })
      .catch((e) => setErr(e?.message || 'Failed to load metrics'))
      .finally(() => isMounted && setLoading(false))
    return () => {
      isMounted = false
    }
  }, [range])

  // Function to download program participants list
  const downloadParticipants = async () => {
    try {
      const response = await fetch('/api/admin/program-participants/export')
      if (!response.ok) {
        throw new Error('Failed to download participants list')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'program-participants.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading participants:', error)
      alert('Failed to download participants list')
    }
  }

  const sparkData = useMemo(() => metrics?.salesSeries?.map((s) => s.value) || [], [metrics])

  const container: React.CSSProperties = { display: 'grid', gap: 16 }
  const headerRow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }
  const kpiGrid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 12,
  }
  const twoCol: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 12,
    alignItems: 'start',
  }

  return (
    <>
      <GlobalNotificationProvider />
      <div style={container} suppressHydrationWarning>
        <div style={headerRow}>
          <h2 style={{ margin: 0 }}>Store Overview</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={downloadParticipants}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                background: '#2563eb',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Download Participants
            </button>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as any)}
              style={{ padding: '6px 8px', borderRadius: 6 }}
            >
              <option value="this-month">This Month</option>
              <option value="all-time">All Time</option>
            </select>
          </div>
        </div>

        {!mounted || loading ? (
          <div style={smallText}>Loading metrics…</div>
        ) : err ? (
          <div style={{ color: '#dc2626', fontSize: 13 }}>{err}</div>
        ) : metrics ? (
          <>
            <div style={kpiGrid}>
              <Card
                title="Gross Sales"
                value={formatBDT(metrics.totals.grossSales)}
                color="#2563eb"
                description={`${metrics.totals.fulfilledOrders} completed orders`}
              />
              <Card
                title="Avg Order Value"
                value={formatBDT(metrics.totals.avgOrderValue || 0)}
                color="#7c3aed"
              />
              <Card
                title="Conversion Rate"
                value={`${(metrics.totals.conversionRate || 0).toFixed(1)}%`}
                color="#16a34a"
                description={`${metrics.totals.totalOrders} total orders`}
              />
              <Card
                title="New Users"
                value={String(metrics.users?.newUsers ?? 0)}
                color="#f59e0b"
              />
              <Card
                title="Active Orders"
                value={String(metrics.totals.activeOrders)}
                color="#0891b2"
              />
            </div>

            <div style={twoCol}>
              <div style={cardStyle}>
                <div style={{ ...smallText, marginBottom: 8 }}>Total sales</div>
                <div style={{ ...bigText, marginBottom: 8, color: '#2563eb' }}>
                  {formatBDT(metrics.totals.grossSales)}
                </div>
                <Spark data={sparkData.length ? sparkData : [0]} />
                <div style={{ ...smallText, marginTop: 8 }}>Last 12 months</div>
              </div>
              <div style={cardStyle}>
                <div style={{ ...smallText, marginBottom: 8 }}>Device sessions</div>
                <DeviceDonut
                  devices={metrics.devices || { mobile: 0, desktop: 0, tablet: 0, other: 0 }}
                />
              </div>
            </div>

            {/* Sales breakdown */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Sales Breakdown</h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: 12,
                }}
              >
                <div>
                  <div style={smallText}>Subtotal</div>
                  <div style={{ ...bigText, color: '#2563eb' }}>
                    {formatBDT(metrics.breakdown.subtotal)}
                  </div>
                </div>
                <div>
                  <div style={smallText}>Shipping</div>
                  <div style={{ ...bigText, color: '#16a34a' }}>
                    {formatBDT(metrics.breakdown.shipping)}
                  </div>
                </div>
                <div>
                  <div style={smallText}>Gross Sales</div>
                  <div style={{ ...bigText, color: '#7c3aed' }}>
                    {formatBDT(metrics.breakdown.grossSales)}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional metrics section */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Order Statistics</h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: 12,
                }}
              >
                <div>
                  <div style={smallText}>Completed</div>
                  <div style={{ ...bigText, color: '#16a34a' }}>
                    {metrics.totals.fulfilledOrders}
                  </div>
                </div>
                <div>
                  <div style={smallText}>Pending</div>
                  <div style={{ ...bigText, color: '#f59e0b' }}>{metrics.totals.activeOrders}</div>
                </div>
                <div>
                  <div style={smallText}>Cancelled</div>
                  <div style={{ ...bigText, color: '#dc2626' }}>
                    {metrics.totals.cancelledOrders}
                  </div>
                </div>
                <div>
                  <div style={smallText}>Total Orders</div>
                  <div style={{ ...bigText }}>{metrics.totals.totalOrders}</div>
                </div>
              </div>
            </div>

            {/* Program Participants Section */}
            <div style={cardStyle}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <h3 style={{ margin: 0 }}>Program Participants</h3>
                <button
                  onClick={downloadParticipants}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Download CSV
                </button>
              </div>
              <div style={{ ...smallText, fontStyle: 'italic' }}>
                Download the complete list of program participants
              </div>
            </div>

            {/* Sales report */}
            <div style={cardStyle}>
              <SalesReport />
            </div>
          </>
        ) : null}
      </div>
    </>
  )
}

function DeviceDonut({
  devices,
}: {
  devices: { mobile: number; desktop: number; tablet: number; other: number }
}) {
  const total = Object.values(devices).reduce((a, b) => a + b, 0) || 1
  const pct = (n: number) => Math.round((n / total) * 100)
  const slices = [
    { key: 'Mobile', value: devices.mobile, color: '#10b981' },
    { key: 'Desktop', value: devices.desktop, color: '#3b82f6' },
    { key: 'Tablet', value: devices.tablet, color: '#f59e0b' },
    { key: 'Other', value: devices.other, color: '#6b7280' },
  ]
  const size = 140
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <svg
        viewBox="0 0 36 36"
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)', display: 'block' }}
      >
        {(() => {
          let acc = 0
          return slices.map((s, i) => {
            const p = (s.value / total) * 100
            const dash = `${p} ${100 - p}`
            const el = (
              <circle
                key={i}
                cx="18"
                cy="18"
                r="16"
                fill="transparent"
                stroke={s.color}
                strokeWidth={4}
                strokeDasharray={dash}
                strokeDashoffset={acc}
              />
            )
            acc -= p
            return el
          })
        })()}
        <circle cx="18" cy="18" r="12" fill="white" />
      </svg>
      <div style={{ fontSize: 12 }}>
        {slices.map((s) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                background: s.color,
                display: 'inline-block',
                borderRadius: 2,
              }}
            />
            <span style={{ width: 60, color: 'var(--theme-text-400, #6b7280)' }}>{s.key}</span>
            <span style={{ fontWeight: 600 }}>{pct(s.value)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
