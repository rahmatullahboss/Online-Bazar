import { NextRequest, NextResponse } from 'next/server'
import { getPayload, Where } from 'payload'
import config from '@/payload.config'

interface SearchParams {
  q?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'name'
  available?: boolean
  featured?: boolean
  page?: number
  limit?: number
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const { searchParams } = new URL(request.url)

    const params: SearchParams = {
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      sort: (searchParams.get('sort') as SearchParams['sort']) || undefined,
      available: searchParams.get('available') === 'true' ? true : undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
    }

    // Build where clause
    let where: Where | undefined = undefined
    const andConditions: Where[] = []

    // Text search on name and description
    if (params.q && params.q.trim()) {
      const searchTerm = params.q.trim()
      andConditions.push({
        or: [
          { name: { contains: searchTerm } },
          { shortDescription: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { 'seo.title': { contains: searchTerm } },
          { tags: { contains: searchTerm } },
        ],
      })
    }

    // Category filter
    if (params.category) {
      // Support both category ID and slug
      const categoryIdOrSlug = params.category
      if (!isNaN(Number(categoryIdOrSlug))) {
        andConditions.push({ category: { equals: Number(categoryIdOrSlug) } })
      } else {
        // Find category by name if not a number
        try {
          const categories = await payload.find({
            collection: 'categories',
            where: { name: { equals: categoryIdOrSlug } },
            limit: 1,
          })
          if (categories.docs.length > 0) {
            andConditions.push({ category: { equals: categories.docs[0].id } })
          }
        } catch {
          // If category lookup fails, continue without filter
        }
      }
    }

    // Price range filter
    if (params.minPrice !== undefined) {
      andConditions.push({ price: { greater_than_equal: params.minPrice } })
    }
    if (params.maxPrice !== undefined) {
      andConditions.push({ price: { less_than_equal: params.maxPrice } })
    }

    // Availability filter
    if (params.available !== undefined) {
      andConditions.push({ available: { equals: params.available } })
    }

    // Featured filter
    if (params.featured !== undefined) {
      andConditions.push({ featured: { equals: params.featured } })
    }

    // Combine conditions
    if (andConditions.length > 0) {
      where = { and: andConditions }
    }

    // Build sort
    let sort: string = '-createdAt' // Default: newest first
    switch (params.sort) {
      case 'price-asc':
        sort = 'price'
        break
      case 'price-desc':
        sort = '-price'
        break
      case 'newest':
        sort = '-createdAt'
        break
      case 'name':
        sort = 'name'
        break
    }

    // Execute search
    const results = await payload.find({
      collection: 'items',
      where,
      sort,
      page: Math.max(1, params.page || 1),
      limit: Math.min(100, Math.max(1, params.limit || 20)),
      depth: 2, // Include category and images
    })

    // Get available categories for filtering
    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
      sort: 'name',
    })

    // Get price range for filters
    const priceStats = await payload.find({
      collection: 'items',
      where: { available: { equals: true } },
      sort: 'price',
      limit: 1,
    })
    const minPriceAvailable = priceStats.docs[0]?.price || 0

    const maxPriceStats = await payload.find({
      collection: 'items',
      where: { available: { equals: true } },
      sort: '-price',
      limit: 1,
    })
    const maxPriceAvailable = maxPriceStats.docs[0]?.price || 10000

    return NextResponse.json({
      items: results.docs,
      pagination: {
        page: results.page,
        limit: results.limit,
        totalPages: results.totalPages,
        totalDocs: results.totalDocs,
        hasNextPage: results.hasNextPage,
        hasPrevPage: results.hasPrevPage,
      },
      filters: {
        categories: categories.docs.map((cat) => ({
          id: cat.id,
          name: cat.name,
        })),
        priceRange: {
          min: minPriceAvailable,
          max: maxPriceAvailable,
        },
      },
      query: params,
    })
  } catch (error) {
    console.error('Search failed:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
