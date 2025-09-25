'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { useList } from 'payload/components/utilities/useList'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { bn } from 'date-fns/locale'

interface Cart {
  id: string
  sessionId: string
  customerEmail: string
  customerNumber: string
  cartTotal: number
  status: 'active' | 'abandoned' | 'recovered'
  lastActivityAt: string
  updatedAt: string
  items: Array<{
    item: { id: string; name: string }
    quantity: number
  }>
}

const AbandonedCartsList: React.FC = () => {
  const [showRecovered, setShowRecovered] = useState(false)
  const router = useRouter()

  const where = showRecovered ? {} : { status: { not_equals: 'recovered' } }

  const { data, isLoading, error } = useList({
    collection: 'abandoned-carts',
    where,
    limit: 20,
    sort: '-lastActivityAt',
  })

  const carts = (data?.docs as Cart[]) || []

  const handleToggleRecovered = () => {
    setShowRecovered(!showRecovered)
  }

  if (error) {
    return <div>Error loading carts: {error.message}</div>
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>
      case 'abandoned':
        return <Badge variant="secondary">Abandoned</Badge>
      case 'recovered':
        return <Badge variant="outline">Recovered</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const formatCurrency = (amount: number) => `৳${amount.toFixed(2)}`

  const formatDate = (dateString: string) => format(new Date(dateString), 'PPP', { locale: bn })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Abandoned Carts</h1>
        <Button onClick={handleToggleRecovered} variant={showRecovered ? 'default' : 'outline'}>
          {showRecovered ? 'Hide Recovered' : 'Show Recovered'}
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {carts.map((cart) => (
              <TableRow key={cart.id}>
                <TableCell className="font-mono text-sm">{cart.sessionId}</TableCell>
                <TableCell>
                  <div>{cart.customerEmail || cart.customerNumber || 'Anonymous'}</div>
                  {cart.customerName && (
                    <div className="text-sm text-muted-foreground">{cart.customerName}</div>
                  )}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(cart.cartTotal || 0)}
                </TableCell>
                <TableCell>{getStatusBadge(cart.status)}</TableCell>
                <TableCell>{formatDate(cart.lastActivityAt)}</TableCell>
                <TableCell>{formatDate(cart.updatedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {data?.hasNextPage && (
        <Button
          onClick={() => {
            /* load next */
          }}
          disabled={isLoading}
        >
          Load More
        </Button>
      )}
      {carts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No carts found{showRecovered ? '' : ' (recovered carts hidden)'} .
        </div>
      )}
    </div>
  )
}

export default AbandonedCartsList
