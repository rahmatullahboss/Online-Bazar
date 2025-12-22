import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

// GET /api/products - List products with filters
export async function GET(request: NextRequest) {
  try {
    const headers = await getHeaders()
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const { user } = await payload.auth({ headers })

    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const stockStatus = searchParams.get('stockStatus') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause
    const whereClause: any = {}

    // Search by name or SKU
    if (search) {
      whereClause.or = [{ name: { contains: search } }, { sku: { contains: search } }]
    }

    // Filter by category
    if (category && category !== 'all') {
      whereClause.category = { equals: category }
    }

    // Filter by stock status
    if (stockStatus === 'in-stock') {
      whereClause['inventoryManagement.stock'] = { greater_than: 5 }
    } else if (stockStatus === 'low-stock') {
      whereClause.and = [
        { 'inventoryManagement.stock': { greater_than: 0 } },
        { 'inventoryManagement.stock': { less_than_equal: 5 } },
      ]
    } else if (stockStatus === 'out-of-stock') {
      whereClause['inventoryManagement.stock'] = { equals: 0 }
    }

    const products = await payload.find({
      collection: 'items',
      depth: 2,
      page,
      limit,
      sort: '-createdAt',
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    })

    // Fetch categories for filter dropdown
    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
    })

    return NextResponse.json({
      products: products.docs,
      totalDocs: products.totalDocs,
      totalPages: products.totalPages,
      page: products.page,
      categories: categories.docs,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const headers = await getHeaders()
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const { user } = await payload.auth({ headers })

    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.description || body.price === undefined) {
      return NextResponse.json(
        { error: 'Name, description, and price are required' },
        { status: 400 },
      )
    }

    const product = await payload.create({
      collection: 'items',
      data: {
        name: body.name,
        sku: body.sku || undefined,
        shortDescription: body.shortDescription || undefined,
        description: body.description,
        price: body.price,
        compareAtPrice: body.compareAtPrice || undefined,
        inventoryManagement: {
          trackInventory: body.trackInventory ?? true,
          stock: body.stock ?? 0,
          lowStockThreshold: body.lowStockThreshold ?? 5,
          allowBackorders: body.allowBackorders ?? false,
        },
        image: body.image || undefined,
        category: body.category || undefined,
        tags: body.tags || [],
        available: body.available ?? true,
        featured: body.featured ?? false,
      },
    })

    return NextResponse.json({ product })
  } catch (error: any) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 },
    )
  }
}
