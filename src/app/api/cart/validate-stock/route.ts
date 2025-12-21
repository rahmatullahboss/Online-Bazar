import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export type StockValidationItem = {
  id: number | string
  quantity: number
}

export type StockValidationResult = {
  id: number
  name: string
  requestedQuantity: number
  availableStock: number
  isAvailable: boolean
  isLowStock: boolean // < 5 items
  priceAtCheck: number
  hasChanged: boolean // price changed from expected
  expectedPrice?: number
}

export type StockValidationResponse = {
  valid: boolean
  items: StockValidationResult[]
  outOfStockItems: StockValidationResult[]
  lowStockItems: StockValidationResult[]
  priceChangedItems: StockValidationResult[]
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const items: StockValidationItem[] = body.items || []
    const expectedPrices: Record<string, number> = body.expectedPrices || {}

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        valid: false,
        items: [],
        outOfStockItems: [],
        lowStockItems: [],
        priceChangedItems: [],
        message: 'No items provided for validation',
      } as StockValidationResponse)
    }

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const results: StockValidationResult[] = []
    const outOfStockItems: StockValidationResult[] = []
    const lowStockItems: StockValidationResult[] = []
    const priceChangedItems: StockValidationResult[] = []

    for (const item of items) {
      const itemId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id
      const requestedQuantity = item.quantity

      try {
        const itemDoc = await payload.findByID({
          collection: 'items',
          id: itemId,
        })

        if (!itemDoc) {
          // Item not found - treat as out of stock
          results.push({
            id: itemId,
            name: 'Unknown Item',
            requestedQuantity,
            availableStock: 0,
            isAvailable: false,
            isLowStock: false,
            priceAtCheck: 0,
            hasChanged: false,
          })
          continue
        }

        // Get inventory info
        const inventoryManagement = (
          itemDoc as { inventoryManagement?: { enabled?: boolean; stock?: number } }
        ).inventoryManagement
        const stockEnabled = inventoryManagement?.enabled ?? false
        const currentStock = inventoryManagement?.stock ?? 999 // If not tracking, assume available
        const isAvailable = (itemDoc as { available?: boolean }).available !== false
        const currentPrice = (itemDoc as { price: number }).price

        // Calculate actual availability
        let availableStock = currentStock
        if (!isAvailable) {
          availableStock = 0
        }

        const canFulfill = stockEnabled ? availableStock >= requestedQuantity : isAvailable
        const isLowStock = stockEnabled && availableStock > 0 && availableStock < 5

        // Check price change
        const expectedPrice = expectedPrices[String(itemId)]
        const hasChanged = expectedPrice !== undefined && expectedPrice !== currentPrice

        const result: StockValidationResult = {
          id: itemId,
          name: (itemDoc as { name: string }).name,
          requestedQuantity,
          availableStock: stockEnabled ? availableStock : 999,
          isAvailable: canFulfill,
          isLowStock,
          priceAtCheck: currentPrice,
          hasChanged,
          expectedPrice,
        }

        results.push(result)

        if (!canFulfill) {
          outOfStockItems.push(result)
        }
        if (isLowStock) {
          lowStockItems.push(result)
        }
        if (hasChanged) {
          priceChangedItems.push(result)
        }
      } catch (error) {
        console.error(`Error checking stock for item ${itemId}:`, error)
        results.push({
          id: itemId,
          name: 'Error Loading Item',
          requestedQuantity,
          availableStock: 0,
          isAvailable: false,
          isLowStock: false,
          priceAtCheck: 0,
          hasChanged: false,
        })
      }
    }

    const valid = outOfStockItems.length === 0 && priceChangedItems.length === 0

    let message = 'All items are available'
    if (outOfStockItems.length > 0) {
      message = `${outOfStockItems.length} item(s) are out of stock or unavailable`
    } else if (priceChangedItems.length > 0) {
      message = `${priceChangedItems.length} item(s) have changed in price`
    } else if (lowStockItems.length > 0) {
      message = `${lowStockItems.length} item(s) are running low in stock`
    }

    return NextResponse.json({
      valid,
      items: results,
      outOfStockItems,
      lowStockItems,
      priceChangedItems,
      message,
    } as StockValidationResponse)
  } catch (error) {
    console.error('Stock validation error:', error)
    return NextResponse.json({ error: 'Failed to validate stock' }, { status: 500 })
  }
}
