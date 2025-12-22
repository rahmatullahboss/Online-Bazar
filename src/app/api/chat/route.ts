import { createGoogleGenerativeAI } from '@ai-sdk/google'
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

// Get API keys - primary and fallback
function getApiKeys() {
  const primary = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  const fallback = process.env.GOOGLE_GENERATIVE_AI_API_KEY_FALLBACK
  return { primary, fallback }
}

// Create Google AI provider with specific API key
function createProvider(apiKey: string) {
  return createGoogleGenerativeAI({ apiKey })
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

GREETING: ALWAYS greet customers with "আসসালামু আলাইকুম" (Assalamu Alaikum) or "সালাম" when they say hello. NEVER use "নমস্কার" (Nomoskar).

CRITICAL: When showing products, you MUST use the EXACT format with REAL product IDs from the list below:
[PRODUCT:id:name:price:category:inStock:imageUrl]

Example: [PRODUCT:67890:মধু:500:Food:true:/media/honey.jpg]

PRODUCT DATABASE (use these EXACT IDs):
${productList}

Rules:
1. Use Bengali when user writes in Bengali, otherwise English
2. Greet with "আসসালামু আলাইকুম" or "সালাম" - NEVER use "নমস্কার"
3. Be friendly, warm, and concise
4. ALWAYS use the [PRODUCT:...] format with EXACT IDs from above
5. Show 1-5 relevant products

Store Info:
- Delivery: Inside and outside Dhaka
- Payment: bKash, Nagad, Cash on Delivery
- Processing: 1-2 business days`
}

// Try to stream with a specific API key
async function tryStreamWithKey(
  apiKey: string,
  systemPrompt: string,
  messages: Awaited<ReturnType<typeof convertToModelMessages>>,
): Promise<Response | null> {
  try {
    const google = createProvider(apiKey)
    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages,
      maxRetries: 0, // No retries, fail fast
    })

    // Get the response and check for errors
    const response = result.toUIMessageStreamResponse()
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string }
    console.log('API call failed:', err.message || error)
    // Return null to indicate failure
    return null
  }
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Fetch products for context
  const products = await getAllProducts()
  const systemPrompt = generateSystemPrompt(products)
  const enhancedMessages = await convertToModelMessages(messages)

  const { primary, fallback } = getApiKeys()
  const keys = [primary, fallback].filter(Boolean) as string[]

  if (keys.length === 0) {
    return new Response(JSON.stringify({ error: 'No API keys configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Try each key in order
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const keyName = i === 0 ? 'Primary' : 'Fallback'
    console.log(`Trying ${keyName} API key...`)

    try {
      const google = createProvider(key)
      const result = streamText({
        model: google('gemini-2.5-flash'),
        system: systemPrompt,
        messages: enhancedMessages,
        maxRetries: 0,
      })

      console.log(`${keyName} API key working!`)
      return result.toUIMessageStreamResponse()
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string; reason?: string }
      console.log(`${keyName} API failed:`, err.message || err.reason || 'Unknown error')

      // If this is the last key, throw the error
      if (i === keys.length - 1) {
        console.error('All API keys exhausted')
        return new Response(
          JSON.stringify({
            error: 'All API keys exhausted. Please try again later.',
            details: err.message,
          }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      }

      // Otherwise continue to next key
      console.log('Switching to next API key...')
    }
  }

  return new Response(JSON.stringify({ error: 'Unexpected error' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  })
}
