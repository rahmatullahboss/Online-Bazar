// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available

import { Payload, PayloadRequest } from 'payload'
import { snackSeedData } from './snacks'

const INSIDE_DHAKA = 'inside_dhaka'

const randomQuantity = () => Math.floor(Math.random() * 3) + 1
const randomPastDateIso = (daysBack: number) =>
  new Date(Date.now() - Math.random() * daysBack * 24 * 60 * 60 * 1000).toISOString()

// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  try {
    // Create categories (unique by name)
    const categoryNames = Array.from(new Set(snackSeedData.map((s) => s.category)))
    const categories = new Map<string, any>()

    for (const name of categoryNames) {
      try {
        const existing = await payload.find({
          collection: 'categories',
          where: { name: { equals: name } },
          limit: 1,
        })

        const doc = existing.docs[0]
          ? existing.docs[0]
          : await payload.create({ collection: 'categories', data: { name }, req })

        categories.set(name, doc)
      } catch (error) {
        payload.logger.warn(
          `Failed to upsert category ${name}: ${String((error as any)?.message || error)}`,
        )
      }
    }

    // Create items with placeholder image URLs
    const createdItems = await Promise.all(
      snackSeedData.map(async (seed) => {
        const cat = categories.get(seed.category)
        return payload.create({
          collection: 'items',
          data: {
            name: seed.name,
            description: seed.description,
            price: seed.price,
            category: cat ? (cat as { id: number }).id : undefined,
            available: seed.available,
            imageUrl: seed.imageUrl,
            inventoryManagement: {
              stock: 100,
            },
          },
          draft: false,
          req,
        })
      }),
    )

    // Create admin user
    const adminExists = await payload.find({
      collection: 'users',
      where: { role: { equals: 'admin' } },
      limit: 1,
    })

    const adminUser = adminExists.docs[0]
      ? adminExists.docs[0]
      : await payload.create({
          collection: 'users',
          data: {
            email: 'admin@onlinebazar.com',
            password: 'admin123',
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            deliveryZone: INSIDE_DHAKA,
          },
          req,
        })

    // Create sample customer user
    const customerExists = await payload.find({
      collection: 'users',
      where: { email: { equals: 'customer@example.com' } },
      limit: 1,
    })

    const customerUser = customerExists.docs[0]
      ? customerExists.docs[0]
      : await payload.create({
          collection: 'users',
          data: {
            email: 'customer@example.com',
            password: 'customer123',
            role: 'user',
            firstName: 'Rahmat',
            lastName: 'Ullah',
            customerNumber: '01739-416661',
            deliveryZone: INSIDE_DHAKA,
          },
          req,
        })

    // Create sample orders with different statuses
    const sampleOrderStatuses = [
      'pending',
      'processing',
      'shipped',
      'completed',
      'cancelled',
      'refunded',
    ] as const

    const paymentMethods: Array<'cod' | 'bkash' | 'nagad'> = ['cod', 'bkash', 'nagad']

    const orderPromises = sampleOrderStatuses.map(async (status, index) => {
      if (!createdItems[index]) return null

      const selectedItem = createdItems[index] as any
      const quantity = randomQuantity()
      const subtotal = Number(selectedItem?.price || 0) * quantity
      const shippingCharge = 0
      const totalAmount = subtotal + shippingCharge
      const paymentMethod = paymentMethods[index % paymentMethods.length]
      const paymentSenderNumber =
        paymentMethod === 'cod'
          ? undefined
          : `01739-41${(6661 + index).toString().padStart(4, '0')}`
      const paymentTransactionId = paymentMethod === 'cod' ? undefined : `TXN-SEED-${index + 1}`

      return payload.create({
        collection: 'orders',
        data: {
          user: (customerUser as any).id,
          customerName: 'Rahmat Ullah',
          customerEmail: 'customer@example.com',
          customerNumber: '01739-416661',
          deliveryZone: INSIDE_DHAKA,
          freeDeliveryApplied: shippingCharge === 0,
          subtotal,
          shippingCharge,
          totalAmount,
          paymentMethod,
          paymentSenderNumber,
          paymentTransactionId,
          items: [
            {
              item: selectedItem.id,
              quantity,
            },
          ],
          status,
          orderDate: randomPastDateIso(30),
          shippingAddress: {
            line1: 'Patua Khali Sadar',
            line2: 'Sayed Nagar',
            city: 'Patuakhali',
            state: 'Barishal',
            postalCode: '8600',
            country: 'Bangladesh',
          },
          deviceType: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)] as any,
          userAgent: 'Sample User Agent',
        },
        req,
      })
    })

    const createdOrders = await Promise.allSettled(orderPromises)
    const successfulOrders = createdOrders.filter((result) => result.status === 'fulfilled').length

    payload.logger.info(
      `Successfully created ${createdItems.length} items, user accounts (${(adminUser as any).email}, ${(customerUser as any).email}) and ${successfulOrders} sample orders with all status types`,
    )
  } catch (error) {
    payload.logger.error(`Error running seed migration: ${String(error)}`)
    throw error
  }
}
