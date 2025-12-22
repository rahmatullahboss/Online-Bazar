import { google } from '@ai-sdk/google'
import { streamText, convertToModelMessages, UIMessage, tool } from 'ai'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { z } from 'zod'

export const runtime = 'nodejs'

// Types for products
interface ProductInfo {
  id: string
  name: string
  price: number
  description: string
  category: string
  inStock: boolean
  imageUrl: string | null
}

// Fetch all products from database
async function getAllProducts(): Promise<ProductInfo[]> {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const items = await payload.find({
      collection: 'items',
      where: { available: { equals: true } },
      depth: 1,
      limit: 100,
    })

    return items.docs.map((item: any) => ({
      id: String(item.id),
      name: item.name,
      price: item.price,
      description: item.shortDescription || item.description || '',
      category:
        typeof item.category === 'object' ? item.category?.name : item.category || 'General',
      inStock: (item.inventoryManagement?.stock ?? 0) > 0,
      imageUrl:
        item.image && typeof item.image === 'object' ? item.image.url : item.imageUrl || null,
    }))
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

// Search products by query
async function searchProducts(query: string): Promise<ProductInfo[]> {
  const products = await getAllProducts()
  const lowerQuery = query.toLowerCase()

  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery),
  )
}

// Generate system prompt
function generateSystemPrompt(products: ProductInfo[]) {
  const productSummary = products
    .slice(0, 20)
    .map((p) => `- ${p.name}: ৳${p.price} (${p.category})`)
    .join('\n')

  return `You are a helpful customer support assistant for "Online Bazar" e-commerce store.

IMPORTANT RULES:
1. When a user asks about a product, ALWAYS use the searchProducts tool to find and display products
2. Use Bengali when the user writes in Bengali, otherwise use English
3. Be friendly, helpful, and concise

Available product categories (for reference):
${productSummary}

Store Info:
- Delivery: Inside and outside Dhaka
- Payment: bKash, Nagad, Cash on Delivery
- Processing: 1-2 business days
- Order tracking: "My Orders" section

Always use the searchProducts tool when users ask about products!`
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Fetch products for context
  const products = await getAllProducts()
  const systemPrompt = generateSystemPrompt(products)

  const result = streamText({
    model: google('gemini-3-flash-preview'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      searchProducts: tool({
        description:
          'Search for products by name, category, or description. Use this when users ask about products.',
        parameters: z.object({
          query: z.string().describe('Search query for products'),
        }),
        execute: async ({ query }) => {
          const results = await searchProducts(query)
          if (results.length === 0) {
            return { products: [], message: 'No products found matching your search.' }
          }
          return {
            products: results.slice(0, 5).map((p) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              category: p.category,
              inStock: p.inStock,
              imageUrl: p.imageUrl,
              description: p.description.slice(0, 100),
            })),
            message: `Found ${results.length} product(s) matching "${query}"`,
          }
        },
      }),
    },
    maxSteps: 3,
  })

  return result.toUIMessageStreamResponse()
}
