import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText, streamText, convertToModelMessages, UIMessage } from 'ai'
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

// Test if API key is working by making a minimal request
async function testApiKey(apiKey: string): Promise<boolean> {
  try {
    const google = createProvider(apiKey)
    await generateText({
      model: google('gemini-2.0-flash'),
      prompt: 'Hi',
      maxTokens: 5,
    })
    return true
  } catch {
    return false
  }
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

  // Find a working API key
  let workingKey: string | null = null
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const keyName = i === 0 ? 'Primary' : 'Fallback'
    console.log(`Testing ${keyName} API key...`)

    const isWorking = await testApiKey(key)
    if (isWorking) {
      console.log(`${keyName} API key is working!`)
      workingKey = key
      break
    } else {
      console.log(`${keyName} API key failed, trying next...`)
    }
  }

  if (!workingKey) {
    console.error('All API keys exhausted')
    return new Response(
      JSON.stringify({
        error: 'সার্ভিস সাময়িকভাবে অনুপলব্ধ। কিছুক্ষণ পর আবার চেষ্টা করুন।',
      }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  // Use the working key for streaming
  const google = createProvider(workingKey)
  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages: enhancedMessages,
  })

  return result.toUIMessageStreamResponse()
}
