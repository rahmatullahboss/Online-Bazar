'use client'
import React, { useEffect, useState } from 'react'

type SalesData = {
  date: string
  orders: number
  sales: number
  avgOrderValue: number
}

export default function SalesReport() {
  const [loading, setLoading] = useState(true)
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d') // Changed default to '7d'

  // Format BDT currency
  const formatBDT = (n: number) =>
    `৳${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true)
      try {
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
        const response = await fetch(`/api/admin/sales-report?days=${days}`)
        const data = await response.json()

        if (response.ok) {
          setSalesData(data)
        } else {
          throw new Error(data.error || 'Failed to fetch sales data')
        }
      } catch (error) {
        console.error('Failed to fetch sales data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSalesData()
  }, [period])

  if (loading) {
    return <div>Loading sales report...</div>
  }

  return (
    <div style={{ padding: '16px 0' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h3 style={{ margin: 0 }}>Sales Report</h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          style={{ padding: '4px 8px', borderRadius: 4 }}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
                Date
              </th>
              <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
                Orders
              </th>
              <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
                Sales
              </th>
              <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
                Avg Order
              </th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((data, index) => (
              <tr key={index}>
                <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{data.date}</td>
                <td
                  style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #e5e7eb' }}
                >
                  {data.orders}
                </td>
                <td
                  style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #e5e7eb' }}
                >
                  {formatBDT(data.sales)}
                </td>
                <td
                  style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #e5e7eb' }}
                >
                  {formatBDT(data.avgOrderValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}