import { google } from '@ai-sdk/google'
import { streamText, convertToModelMessages, UIMessage } from 'ai'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const runtime = 'nodejs' // Changed from edge to nodejs to support Payload

// Fetch products from database
async function getProductsForContext() {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const items = await payload.find({
      collection: 'items',
      where: { available: { equals: true } },
      depth: 1,
      limit: 50, // Get top 50 products
    })

    return items.docs.map((item: any) => ({
      name: item.name,
      price: item.price,
      description: item.shortDescription || item.description,
      category: typeof item.category === 'object' ? item.category?.name : item.category,
      inStock: (item.inventoryManagement?.stock ?? 0) > 0,
    }))
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

// Generate system prompt with product knowledge
function generateSystemPrompt(products: any[]) {
  const productList = products
    .map(
      (p) =>
        `- ${p.name}: ৳${p.price} (${p.category || 'General'}) - ${p.inStock ? 'In Stock' : 'Out of Stock'}${p.description ? ` | ${p.description.slice(0, 100)}` : ''}`,
    )
    .join('\n')

  return `You are a helpful customer support assistant for an online e-commerce store called "Online Bazar". 

Your role is to:
- Answer questions about products, orders, and shipping
- Help customers with their purchases
- Provide friendly and professional support
- Use Bengali language when the customer writes in Bengali, otherwise use English
- Keep responses concise and helpful
- Recommend products based on customer needs

Important information:
- Delivery is available inside and outside Dhaka
- Payment methods: bKash, Nagad, Cash on Delivery
- Orders are typically processed within 1-2 business days
- For order tracking, customers can check their order status in "My Orders" section

AVAILABLE PRODUCTS:
${productList || 'No products currently available.'}

When customers ask about products, use the above list to provide accurate information about names, prices, and availability. If they ask for something not in the list, politely inform them and suggest similar available products.

Be friendly, professional, and always aim to help customers!`
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Fetch products for context
  const products = await getProductsForContext()
  const systemPrompt = generateSystemPrompt(products)

  const result = streamText({
    model: google('gemini-3-flash-preview'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
