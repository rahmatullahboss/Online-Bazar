import { createOpenRouter } from '@openrouter/ai-sdk-provider'
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

// Create OpenRouter provider
function getOpenRouter() {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set')
  }
  return createOpenRouter({ apiKey })
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

// Generate system prompt with product data including IDs
function generateSystemPrompt(products: ProductInfo[]) {
  const productList = products
    .slice(0, 30)
    .map(
      (p) =>
        `- ID:${p.id} | ${p.name} | ৳${p.price} | ${p.category} | ${p.inStock ? 'In Stock' : 'Out'} | Image:${p.imageUrl || 'none'}`,
    )
    .join('\n')

  return `You are a helpful customer support assistant for "Online Bazar" e-commerce store.

LANGUAGE: Use Bengali when user writes in Bengali, otherwise English.
GREETING: Greet with "সালাম" or "আসসালামু আলাইকুম" - NEVER use "নমস্কার"

##MANDATORY PRODUCT FORMAT##
When showing ANY product, you MUST ALWAYS output it in this EXACT format:
[PRODUCT:id:name:price:category:inStock:imageUrl]

Example output:
[PRODUCT:123:Premium Tea:250:Food & Grocery:true:/media/tea.jpg]
[PRODUCT:456:Honey:500:Food & Grocery:true:/media/honey.jpg]

##AVAILABLE PRODUCTS (USE ONLY THESE)##
${productList}

##RULES##
1. When user asks "ki ache", "product dekhan", "ki ki ache", or similar - you MUST show 3-5 products using the [PRODUCT:...] format
2. NEVER describe products in plain text - ALWAYS use the [PRODUCT:...] format
3. Pick relevant products from the list above
4. After showing products, ask if they want to see more or need help

##ORDERING##
- You CANNOT take orders directly
- Tell customers: "অর্ডার করতে উপরে প্রোডাক্ট কার্ডে ক্লিক করুন, Add to Cart করুন এবং Checkout এ যান!"
- NEVER ask for customer info or confirm orders

##STORE INFO##
- Delivery: Inside and outside Dhaka
- Payment: bKash, Nagad, Cash on Delivery
- Processing: 1-2 business days`
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Fetch products for context
  const products = await getAllProducts()
  const systemPrompt = generateSystemPrompt(products)
  const enhancedMessages = await convertToModelMessages(messages)

  try {
    const openrouter = getOpenRouter()

    const result = streamText({
      model: openrouter('xiaomi/mimo-v2-flash:free'),
      system: systemPrompt,
      messages: enhancedMessages,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: 'Chat service unavailable. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
