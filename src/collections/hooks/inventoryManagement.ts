import type { CollectionAfterChangeHook } from 'payload'

/**
 * Hook to manage inventory when orders are created, updated, or cancelled
 */
const inventoryManagement: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const payload = req?.payload
  if (!payload) return doc

  try {
    const items: any[] = Array.isArray((doc as any).items) ? ((doc as any).items as any[]) : []
    const previousItems: any[] =
      operation === 'update' && previousDoc
        ? Array.isArray((previousDoc as any).items)
          ? ((previousDoc as any).items as any[])
          : []
        : []

    const currentStatus = (doc as any)?.status
    const previousStatus = (previousDoc as any)?.status

    // Handle new order creation - deduct stock
    if (operation === 'create' && currentStatus !== 'cancelled') {
      await deductStock(payload, items)
    }

    // Handle order status changes
    if (operation === 'update') {
      // Order was cancelled - restore stock
      if (
        currentStatus === 'cancelled' &&
        previousStatus !== 'cancelled' &&
        previousStatus !== 'refunded'
      ) {
        await restoreStock(payload, previousItems)
      }

      // Order was refunded - restore stock
      if (currentStatus === 'refunded' && previousStatus !== 'refunded') {
        await restoreStock(payload, previousItems)
      }

      // Order was un-cancelled (rare case) - deduct stock again
      if (previousStatus === 'cancelled' && currentStatus !== 'cancelled') {
        await deductStock(payload, items)
      }
    }

    // Check for low stock alerts
    await checkLowStockAlerts(payload, items)
  } catch (error) {
    req?.payload?.logger?.error?.('Inventory management hook failed', error as any)
  }

  return doc
}

/**
 * Deduct stock for ordered items
 */
async function deductStock(payload: any, items: any[]) {
  for (const item of items) {
    const itemId = getItemId(item)
    const quantity = Number(item?.quantity ?? 1)

    if (!itemId) continue

    try {
      const itemDoc = await payload.findByID({ collection: 'items', id: itemId })
      if (!itemDoc) continue

      const inventoryManagement = (itemDoc as any)?.inventoryManagement
      if (!inventoryManagement?.trackInventory) continue

      const currentStock = Number(inventoryManagement?.stock ?? 0)
      const newStock = Math.max(0, currentStock - quantity)

      await payload.update({
        collection: 'items',
        id: itemId,
        data: {
          inventoryManagement: {
            ...inventoryManagement,
            stock: newStock,
          },
          // Auto-disable if out of stock and backorders not allowed
          ...(newStock <= 0 &&
            !inventoryManagement?.allowBackorders && {
              available: false,
            }),
        },
      })

      payload.logger?.info?.(
        `Stock deducted: Item ${itemId}, Qty: ${quantity}, New Stock: ${newStock}`,
      )
    } catch (error) {
      payload.logger?.error?.(`Failed to deduct stock for item ${itemId}`, error)
    }
  }
}

/**
 * Restore stock for cancelled/refunded orders
 */
async function restoreStock(payload: any, items: any[]) {
  for (const item of items) {
    const itemId = getItemId(item)
    const quantity = Number(item?.quantity ?? 1)

    if (!itemId) continue

    try {
      const itemDoc = await payload.findByID({ collection: 'items', id: itemId })
      if (!itemDoc) continue

      const inventoryManagement = (itemDoc as any)?.inventoryManagement
      if (!inventoryManagement?.trackInventory) continue

      const currentStock = Number(inventoryManagement?.stock ?? 0)
      const newStock = currentStock + quantity

      await payload.update({
        collection: 'items',
        id: itemId,
        data: {
          inventoryManagement: {
            ...inventoryManagement,
            stock: newStock,
          },
          // Re-enable if was out of stock
          available: true,
        },
      })

      payload.logger?.info?.(
        `Stock restored: Item ${itemId}, Qty: ${quantity}, New Stock: ${newStock}`,
      )
    } catch (error) {
      payload.logger?.error?.(`Failed to restore stock for item ${itemId}`, error)
    }
  }
}

/**
 * Check and send low stock alerts
 */
async function checkLowStockAlerts(payload: any, items: any[]) {
  const lowStockItems: { name: string; stock: number; threshold: number }[] = []

  for (const item of items) {
    const itemId = getItemId(item)
    if (!itemId) continue

    try {
      const itemDoc = await payload.findByID({ collection: 'items', id: itemId })
      if (!itemDoc) continue

      const inventoryManagement = (itemDoc as any)?.inventoryManagement
      if (!inventoryManagement?.trackInventory) continue

      const stock = Number(inventoryManagement?.stock ?? 0)
      const threshold = Number(inventoryManagement?.lowStockThreshold ?? 5)

      if (stock <= threshold && stock > 0) {
        lowStockItems.push({
          name: (itemDoc as any)?.name || `Item #${itemId}`,
          stock,
          threshold,
        })
      }
    } catch {
      // Silently continue
    }
  }

  // Send low stock alert email to admin
  if (lowStockItems.length > 0) {
    const adminEmail = process.env.ORDER_NOTIFICATIONS_EMAIL || process.env.GMAIL_USER
    if (adminEmail) {
      const companyName = process.env.EMAIL_DEFAULT_FROM_NAME || 'Online Bazar'
      const itemsList = lowStockItems
        .map((item) => `• ${item.name}: ${item.stock} remaining (threshold: ${item.threshold})`)
        .join('\n')

      const htmlList = lowStockItems
        .map(
          (item) =>
            `<li><strong>${item.name}</strong>: ${item.stock} remaining (threshold: ${item.threshold})</li>`,
        )
        .join('')

      try {
        await payload.sendEmail?.({
          to: adminEmail,
          subject: `⚠️ Low Stock Alert - ${lowStockItems.length} item(s)`,
          text: `Low Stock Alert\n\nThe following items are running low on stock:\n\n${itemsList}\n\nPlease restock these items soon.\n\n${companyName} Inventory System`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#f59e0b;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
                <h2 style="margin:0;">⚠️ Low Stock Alert</h2>
              </div>
              <div style="padding:20px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
                <p>The following items are running low on stock:</p>
                <ul style="list-style:none;padding:0;">${htmlList}</ul>
                <p style="margin-top:20px;color:#6b7280;">Please restock these items soon.</p>
                <p style="color:#6b7280;font-size:12px;">${companyName} Inventory System</p>
              </div>
            </div>
          `,
        })
      } catch {
        // Email is optional, don't fail the hook
      }
    }
  }
}

/**
 * Extract item ID from order item
 */
function getItemId(item: any): string | null {
  const rel = item?.item
  if (rel && typeof rel === 'object') {
    if (typeof rel.id === 'string' || typeof rel.id === 'number') {
      return String(rel.id)
    }
    if (typeof rel.value === 'string' || typeof rel.value === 'number') {
      return String(rel.value)
    }
  } else if (rel != null && (typeof rel === 'string' || typeof rel === 'number')) {
    return String(rel)
  }
  return null
}

export default inventoryManagement
