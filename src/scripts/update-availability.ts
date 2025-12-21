import { getPayload } from 'payload'
import config from '../payload.config'

async function updateItemsAvailability() {
  console.log('🔄 Updating items availability...')

  const payload = await getPayload({ config })

  const items = await payload.find({
    collection: 'items',
    limit: 100,
  })

  for (const item of items.docs) {
    await payload.update({
      collection: 'items',
      id: item.id,
      data: {
        available: true,
        inventoryManagement: {
          trackInventory: false, // Disable tracking so stock doesn't affect availability
          stock: 100,
          lowStockThreshold: 5,
          allowBackorders: true,
        },
      },
    })
    console.log('✅ Updated:', item.name)
  }

  console.log('\n🎉 All items are now available!')
  process.exit(0)
}

updateItemsAvailability().catch((error) => {
  console.error('❌ Failed:', error)
  process.exit(1)
})
