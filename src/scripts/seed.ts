import { getPayload } from 'payload'
import config from '../payload.config'

async function seedDatabase() {
  console.log('🌱 Starting database seed...')

  const payload = await getPayload({ config })

  // Create categories
  const categoryData = [
    { name: 'Electronics', description: 'Electronic gadgets and devices' },
    { name: 'Fashion', description: 'Clothing and accessories' },
    { name: 'Home & Living', description: 'Home decor and furniture' },
    { name: 'Food & Grocery', description: 'Food items and groceries' },
  ]

  const categories: Record<string, number> = {}

  for (const cat of categoryData) {
    const existing = await payload.find({
      collection: 'categories',
      where: { name: { equals: cat.name } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      const created = await payload.create({
        collection: 'categories',
        data: cat,
      })
      categories[cat.name] = created.id
      console.log('✅ Created category:', cat.name)
    } else {
      categories[cat.name] = existing.docs[0].id
      console.log('⏭️  Category exists:', cat.name)
    }
  }

  // Create items
  const itemData = [
    {
      name: 'Wireless Earbuds Pro',
      price: 2500,
      category: 'Electronics',
      description:
        'High quality wireless earbuds with active noise cancellation and 24-hour battery life.',
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
    },
    {
      name: 'Smart Watch X1',
      price: 4500,
      category: 'Electronics',
      description: 'Feature-packed smartwatch with health monitoring, GPS, and water resistance.',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    },
    {
      name: 'Bluetooth Speaker',
      price: 1800,
      category: 'Electronics',
      description: 'Portable Bluetooth speaker with deep bass and 12-hour playtime.',
      imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
    },
    {
      name: 'Premium Cotton T-Shirt',
      price: 599,
      category: 'Fashion',
      description: 'Premium quality cotton t-shirt, soft, comfortable and perfect for daily wear.',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    },
    {
      name: 'Leather Wallet',
      price: 1200,
      category: 'Fashion',
      description: 'Genuine leather wallet with RFID blocking and multiple card slots.',
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop',
    },
    {
      name: 'Designer Sunglasses',
      price: 2200,
      category: 'Fashion',
      description: 'UV protection sunglasses with polarized lenses and stylish frame.',
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
    },
    {
      name: 'Decorative Table Lamp',
      price: 850,
      category: 'Home & Living',
      description: 'Modern decorative table lamp with adjustable brightness for your living room.',
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
    },
    {
      name: 'Throw Pillow Set',
      price: 650,
      category: 'Home & Living',
      description: 'Set of 2 decorative throw pillows with premium fabric cover.',
      imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop',
    },
    {
      name: 'Pure Organic Honey',
      price: 450,
      category: 'Food & Grocery',
      description: 'Pure organic honey from local farms, 500g jar.',
      imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop',
    },
    {
      name: 'Premium Tea Collection',
      price: 380,
      category: 'Food & Grocery',
      description: 'Assorted premium tea collection with 50 tea bags.',
      imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop',
    },
  ]

  for (const item of itemData) {
    const existing = await payload.find({
      collection: 'items',
      where: { name: { equals: item.name } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'items',
        data: {
          name: item.name,
          price: item.price,
          description: item.description,
          imageUrl: item.imageUrl,
          category: categories[item.category],
          available: true,
        },
      })
      console.log('✅ Created item:', item.name, `(৳${item.price})`)
    } else {
      console.log('⏭️  Item exists:', item.name)
    }
  }

  // Create admin user
  const adminExists = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@store.com' } },
    limit: 1,
  })

  if (adminExists.docs.length === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@store.com',
        password: 'admin123',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        deliveryZone: 'inside_dhaka',
      },
    })
    console.log('✅ Created admin: admin@store.com / admin123')
  } else {
    console.log('⏭️  Admin exists: admin@store.com')
  }

  console.log('\n🎉 Seeding complete!')
  console.log('📧 Admin login: admin@store.com / admin123')
  console.log('🌐 Visit: http://localhost:3000/admin')

  process.exit(0)
}

seedDatabase().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
