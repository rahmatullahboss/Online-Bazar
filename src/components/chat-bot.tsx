'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, User, Loader2, Users, Phone, ShoppingCart, ExternalLink } from 'lucide-react'
import { FaFacebookMessenger, FaWhatsapp } from 'react-icons/fa'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CONTACT_WHATSAPP, SOCIAL_FACEBOOK, CONTACT_PHONE_RAW } from '@/lib/site-config'

// Product type parsed from AI response
interface Product {
  id: string
  name: string
  price: number
  category: string
  inStock: boolean
  imageUrl: string | null
}

// Parse products from AI text response
// Format: [PRODUCT:id:name:price:category:inStock:imageUrl]
function parseProductsFromText(text: string): { cleanText: string; products: Product[] } {
  const productRegex = /\[PRODUCT:([^:]+):([^:]+):(\d+):([^:]+):(true|false):([^\]]*)\]/g
  const products: Product[] = []
  let match

  while ((match = productRegex.exec(text)) !== null) {
    products.push({
      id: match[1],
      name: match[2],
      price: parseInt(match[3], 10),
      category: match[4],
      inStock: match[5] === 'true',
      imageUrl: match[6] || null,
    })
  }

  // Remove product tags from text and clean up extra newlines
  const cleanText = text
    .replace(productRegex, '')
    .replace(/\n{3,}/g, '\n\n') // Reduce 3+ newlines to 2
    .trim()

  return { cleanText, products }
}

// Product Card Component for Chat
function ChatProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/item/${product.id}`}
      className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
    >
      <div className="flex gap-3 p-2">
        {/* Product Image */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCart className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm line-clamp-1 group-hover:text-amber-600 transition-colors">
            {product.name}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="font-bold text-amber-600">৳{product.price.toLocaleString()}</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full',
                product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
              )}
            >
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center">
          <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-amber-500 transition-colors" />
        </div>
      </div>
    </Link>
  )
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [showHumanOptions, setShowHumanOptions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Listen for custom event to open chatbot
  useEffect(() => {
    const handleOpenChatbot = () => setIsOpen(true)
    window.addEventListener('open-chatbot', handleOpenChatbot)
    return () => window.removeEventListener('open-chatbot', handleOpenChatbot)
  }, [])

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, showHumanOptions])

  // Auto-focus input when chat is ready for new message
  useEffect(() => {
    if (status === 'ready' && isOpen) {
      inputRef.current?.focus()
    }
  }, [status, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && status === 'ready') {
      sendMessage({ text: input })
      setInput('')
      setShowHumanOptions(false)
      // Keep focus on input
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  // Render message with product cards
  const renderMessageContent = (message: (typeof messages)[0]) => {
    // Get text from message parts
    const textContent = message.parts
      .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map((part) => part.text)
      .join('')

    // Parse products from text
    const { cleanText, products } = parseProductsFromText(textContent)

    return (
      <>
        {cleanText && <p className="whitespace-pre-wrap">{cleanText}</p>}
        {products.length > 0 && (
          <div className="mt-2 space-y-2">
            {products.map((product, idx) => (
              <ChatProductCard key={`${product.id}-${idx}`} product={product} />
            ))}
          </div>
        )}
      </>
    )
  }

  // Generate WhatsApp link
  const getWhatsAppLink = () => {
    const message = encodeURIComponent('হ্যালো, আমি Online Bazar থেকে সাহায্য চাই।')
    return `https://wa.me/${CONTACT_WHATSAPP.replace(/[^0-9]/g, '')}?text=${message}`
  }

  // Generate Messenger link
  const getMessengerLink = () => {
    const fbUrl = SOCIAL_FACEBOOK || 'https://www.facebook.com/onlinebazarbarguna'
    const pageId = fbUrl.split('/').pop() || 'onlinebazarbarguna'
    return `https://m.me/${pageId}`
  }

  return (
    <>
      {/* Chat Window */}
      <div
        className={cn(
          'fixed z-50 transition-all duration-300 ease-out',
          'bottom-20 right-4 md:bottom-6 md:right-6',
          'w-[calc(100vw-2rem)] max-w-sm',
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
        )}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[70vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-rose-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Assistant</h3>
                <p className="text-xs text-white/80">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[350px]">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-100 to-rose-100 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-amber-600" />
                </div>
                <p className="text-gray-600 text-sm">Hi! 👋 How can I help you today?</p>
                <p className="text-gray-400 text-xs mt-1">
                  Ask me about products, orders, or shipping
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-2',
                  message.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-2 text-sm',
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md',
                  )}
                >
                  {renderMessageContent(message)}
                </div>
                {message.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-2">
                <p className="text-red-500 text-xs">Something went wrong. Please try again.</p>
              </div>
            )}

            {/* Human Handoff Options */}
            {showHumanOptions && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-800">Connect with Human Agent</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <a
                    href={getMessengerLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#0084FF] text-white px-4 py-2.5 rounded-lg hover:bg-[#0073E6] transition-colors text-sm font-medium"
                  >
                    <FaFacebookMessenger className="w-4 h-4" />
                    Facebook Messenger
                  </a>
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-lg hover:bg-[#1DA851] transition-colors text-sm font-medium"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${CONTACT_PHONE_RAW}`}
                    className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                  >
                    <Phone className="w-4 h-4" />
                    Call Us
                  </a>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Talk to Human Button */}
          <div className="px-4 pb-2">
            <button
              onClick={() => setShowHumanOptions(!showHumanOptions)}
              className={cn(
                'w-full py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2',
                showHumanOptions
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100',
              )}
            >
              <Users className="w-3.5 h-3.5" />
              {showHumanOptions ? 'Close Options' : 'Talk to Human Agent'}
            </button>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-sm"
                disabled={status !== 'ready'}
              />
              <button
                type="submit"
                disabled={status !== 'ready' || !input.trim()}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                  input.trim() && status === 'ready'
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white'
                    : 'bg-gray-100 text-gray-400',
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
