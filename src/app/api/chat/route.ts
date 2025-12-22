import { google } from '@ai-sdk/google'
import { streamText, convertToModelMessages, UIMessage } from 'ai'
import { getPayload } from 'payload'
import config from '@/payload.config'

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

    return items.docs.map((item) => ({
      id: String(item.id),
      name: item.name,
      price: item.price,
      description: item.shortDescription || item.description || '',
      category:
        typeof item.category === 'object' && item.category !== null
          ? (item.category as { name?: string }).name || 'General'
          : 'General',
      inStock: (item.inventoryManagement?.stock ?? 0) > 0,
      imageUrl:
        item.image && typeof item.image === 'object'
          ? (item.image as { url?: string }).url || null
          : item.imageUrl || null,
    }))
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

// Generate system prompt with product data
function generateSystemPrompt(products: ProductInfo[]) {
  const productList = products
    .slice(0, 30)
    .map((p) => `- ${p.name}: ৳${p.price} (${p.category}) ${p.inStock ? '✓ In Stock' : '✗ Out'}`)
    .join('\n')

  return `You are a helpful customer support assistant for "Online Bazar" e-commerce store.

IMPORTANT: When users ask about products, include the product details in your response like this:
[PRODUCT:id:name:price:category:inStock:imageUrl]

For example: [PRODUCT:abc123:Honey:500:Food:true:/images/honey.jpg]

AVAILABLE PRODUCTS:
${productList}

Rules:
1. Use Bengali when the user writes in Bengali, otherwise use English
2. Be friendly, helpful, and concise
3. When showing products, always include the [PRODUCT:...] format
4. Show up to 3-5 relevant products

Store Info:
- Delivery: Inside and outside Dhaka
- Payment: bKash, Nagad, Cash on Delivery
- Processing: 1-2 business days
- Order tracking: "My Orders" section`
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Fetch products for context
  const products = await getAllProducts()
  const systemPrompt = generateSystemPrompt(products)

  // Also add product data to the first user message for context
  const enhancedMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages: enhancedMessages,
  })

  return result.toUIMessageStreamResponse()
}
