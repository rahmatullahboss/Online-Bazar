'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Download, FileText, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SITE_NAME } from '@/lib/site-config'

interface OrderActionsProps {
  orders: Array<{
    id: string
    customerName: string
    customerEmail: string
    customerNumber: string
    status: string
    totalAmount: number
    shippingCharge: number
    orderDate: string
    paymentMethod: string
    deliveryZone: string
    shippingAddress?: {
      line1: string
      line2?: string
      city: string
      state?: string
      postalCode: string
      country: string
    }
    items: Array<{
      item: { name: string; price: number } | null
      quantity: number
    }>
  }>
  selectedOrders?: string[]
  onSelectionChange?: (ids: string[]) => void
}

export function OrderActions({
  orders,
  selectedOrders = [],
  onSelectionChange,
}: OrderActionsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Export orders to CSV
  const handleExportCSV = () => {
    setIsExporting(true)

    const ordersToExport =
      selectedOrders.length > 0 ? orders.filter((o) => selectedOrders.includes(o.id)) : orders

    // Create CSV header
    const headers = [
      'Order ID',
      'Customer Name',
      'Email',
      'Phone',
      'Status',
      'Total Amount',
      'Shipping Charge',
      'Payment Method',
      'Delivery Zone',
      'Address',
      'City',
      'Order Date',
      'Items',
    ].join(',')

    // Create CSV rows
    const rows = ordersToExport.map((order) => {
      const items = order.items.map((i) => `${i.item?.name || 'Unknown'} x${i.quantity}`).join('; ')

      return [
        order.id,
        `"${order.customerName}"`,
        order.customerEmail,
        order.customerNumber,
        order.status,
        order.totalAmount,
        order.shippingCharge,
        order.paymentMethod,
        order.deliveryZone,
        `"${order.shippingAddress?.line1 || ''}"`,
        order.shippingAddress?.city || '',
        new Date(order.orderDate).toISOString().split('T')[0],
        `"${items}"`,
      ].join(',')
    })

    const csv = [headers, ...rows].join('\n')

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setIsExporting(false)
  }

  // Print invoice
  const handlePrintInvoice = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return

    const formatBDT = (n: number) => `৳${n.toFixed(2)}`

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; color: #d97706; }
          .invoice-title { font-size: 18px; color: #666; margin-top: 10px; }
          .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .details-section { flex: 1; }
          .details-section h3 { margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .details-section p { margin: 5px 0; color: #666; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .items-table th { background: #f5f5f5; }
          .items-table .price { text-align: right; }
          .totals { text-align: right; margin-top: 20px; }
          .totals p { margin: 5px 0; }
          .grand-total { font-size: 18px; font-weight: bold; color: #d97706; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${SITE_NAME}</div>
          <div class="invoice-title">INVOICE</div>
        </div>
        
        <div class="details">
          <div class="details-section">
            <h3>Bill To:</h3>
            <p><strong>${order.customerName}</strong></p>
            <p>${order.customerEmail}</p>
            <p>${order.customerNumber}</p>
            ${
              order.shippingAddress
                ? `
              <p>${order.shippingAddress.line1}</p>
              ${order.shippingAddress.line2 ? `<p>${order.shippingAddress.line2}</p>` : ''}
              <p>${order.shippingAddress.city}, ${order.shippingAddress.postalCode}</p>
            `
                : ''
            }
          </div>
          <div class="details-section" style="text-align: right;">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice #:</strong> ${order.id}</p>
            <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
            <p><strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}</p>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th class="price">Qty</th>
              <th class="price">Unit Price</th>
              <th class="price">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td>${item.item?.name || 'Unknown Item'}</td>
                <td class="price">${item.quantity}</td>
                <td class="price">${formatBDT(item.item?.price || 0)}</td>
                <td class="price">${formatBDT((item.item?.price || 0) * item.quantity)}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>

        <div class="totals">
          <p>Subtotal: ${formatBDT(order.totalAmount - order.shippingCharge)}</p>
          <p>Shipping: ${formatBDT(order.shippingCharge)}</p>
          <p class="grand-total">Grand Total: ${formatBDT(order.totalAmount)}</p>
        </div>

        <div class="footer">
          <p>Thank you for shopping with ${SITE_NAME}!</p>
          <p>For any queries, please contact us.</p>
        </div>
      </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(invoiceHTML)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 250)
    }
  }

  // Bulk update status
  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedOrders.length === 0) {
      alert('Please select orders to update')
      return
    }

    startTransition(async () => {
      try {
        for (const orderId of selectedOrders) {
          await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          })
        }
        router.refresh()
        if (onSelectionChange) onSelectionChange([])
      } catch (error) {
        console.error('Bulk update failed:', error)
        alert('Failed to update some orders')
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={isExporting}
          className="gap-2"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export CSV
          {selectedOrders.length > 0 && ` (${selectedOrders.length})`}
        </Button>

        {selectedOrders.length === 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePrintInvoice(selectedOrders[0])}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Print Invoice
          </Button>
        )}
      </div>

      {selectedOrders.length > 0 && (
        <div className="flex items-center gap-2 border-l border-gray-300 pl-3">
          <span className="text-sm text-gray-600">
            {selectedOrders.length} selected • Bulk Actions:
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkStatusUpdate('processing')}
            disabled={isPending}
            className="gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            Mark Processing
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkStatusUpdate('shipped')}
            disabled={isPending}
            className="gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            Mark Shipped
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkStatusUpdate('completed')}
            disabled={isPending}
            className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            Complete
          </Button>
        </div>
      )}
    </div>
  )
}

export default OrderActions
