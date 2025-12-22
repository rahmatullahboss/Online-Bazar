'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bot, Phone, Mail, MessageCircle, Clock, Search, ArrowLeft, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface Conversation {
  id: string
  sessionId: string
  user?: {
    id: string
    email: string
  }
  guestInfo?: {
    name: string
    phone: string
  }
  messages: Message[]
  messageCount: number
  lastMessageAt: string
  createdAt: string
}

export default function ChatMessengerPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/chat-conversations')
      const data = await res.json()
      setConversations(data.docs || [])
      // Auto-select first conversation on desktop
      if (data.docs?.length > 0 && !selectedId && window.innerWidth >= 768) {
        setSelectedId(data.docs[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedId])

  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchQuery.toLowerCase()
    const guestName = conv.guestInfo?.name?.toLowerCase() || ''
    const guestPhone = conv.guestInfo?.phone || ''
    const userEmail = conv.user?.email?.toLowerCase() || ''
    return (
      guestName.includes(searchLower) ||
      guestPhone.includes(searchLower) ||
      userEmail.includes(searchLower)
    )
  })

  const selectedConversation = conversations.find((c) => c.id === selectedId)

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'এইমাত্র'
    if (diffMins < 60) return `${diffMins} মিনিট আগে`
    if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`
    if (diffDays < 7) return `${diffDays} দিন আগে`
    return date.toLocaleDateString('bn-BD')
  }

  const getCustomerName = (conv: Conversation) => {
    if (conv.user?.email) return conv.user.email.split('@')[0]
    if (conv.guestInfo?.name) return conv.guestInfo.name
    return 'Unknown'
  }

  const getLastMessage = (conv: Conversation) => {
    if (!conv.messages?.length) return 'No messages'
    const last = conv.messages[conv.messages.length - 1]
    const text = last.content.replace(/\[PRODUCT:[^\]]+\]/g, '[পণ্য]').slice(0, 50)
    return text + (last.content.length > 50 ? '...' : '')
  }

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Link href="/admin-dashboard">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">Chat Inbox</h1>
              <p className="text-xs text-white/70">{conversations.length} conversations</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-white/20 text-white border-0">
            <Users className="w-3 h-3 mr-1" />
            {conversations.filter((c) => c.messages?.length > 0).length} active
          </Badge>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Customer List */}
        <div
          className={cn(
            'w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col',
            selectedId && 'hidden md:flex',
          )}
        >
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No conversations found</p>
              </div>
            ) : (
              <div>
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={cn(
                      'flex items-center gap-3 p-4 cursor-pointer border-b border-gray-50 hover:bg-violet-50 transition-colors',
                      selectedId === conv.id && 'bg-violet-100 border-l-4 border-l-violet-500',
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0',
                        conv.user
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                          : 'bg-gradient-to-br from-violet-400 to-purple-500',
                      )}
                    >
                      {getInitials(getCustomerName(conv))}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {getCustomerName(conv)}
                        </h3>
                        <span className="text-[11px] text-gray-400 flex-shrink-0">
                          {formatTime(conv.lastMessageAt || conv.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {conv.user ? (
                          <Mail className="w-3 h-3 text-green-500 flex-shrink-0" />
                        ) : (
                          <Phone className="w-3 h-3 text-violet-500 flex-shrink-0" />
                        )}
                        <p className="text-sm text-gray-500 truncate">{getLastMessage(conv)}</p>
                      </div>
                      {conv.guestInfo?.phone && (
                        <p className="text-xs text-gray-400 mt-1">{conv.guestInfo.phone}</p>
                      )}
                    </div>

                    {/* Unread indicator */}
                    {conv.messages?.length > 0 && (
                      <div className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn('flex-1 flex flex-col bg-gray-50', !selectedId && 'hidden md:flex')}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setSelectedId(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold',
                    selectedConversation.user
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                      : 'bg-gradient-to-br from-violet-400 to-purple-500',
                  )}
                >
                  {getInitials(getCustomerName(selectedConversation))}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">
                    {getCustomerName(selectedConversation)}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {selectedConversation.user ? (
                      <>
                        <Mail className="w-3 h-3" />
                        <span>{selectedConversation.user.email}</span>
                      </>
                    ) : (
                      <>
                        <Phone className="w-3 h-3" />
                        <span>{selectedConversation.guestInfo?.phone || 'No phone'}</span>
                      </>
                    )}
                    <span className="text-gray-300">•</span>
                    <span>{selectedConversation.messages?.length || 0} messages</span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    selectedConversation.user
                      ? 'border-green-200 text-green-700 bg-green-50'
                      : 'border-violet-200 text-violet-700 bg-violet-50',
                  )}
                >
                  {selectedConversation.user ? 'Logged In' : 'Guest'}
                </Badge>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages?.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex gap-3',
                      msg.role === 'user' ? 'justify-end' : 'justify-start',
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="max-w-[70%]">
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-3 shadow-sm',
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-br-md'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md',
                        )}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {msg.content.replace(/\[PRODUCT:[^\]]+\]/g, '📦 [পণ্য দেখুন]')}
                        </p>
                      </div>
                      <p
                        className={cn(
                          'text-[10px] mt-1 px-1',
                          msg.role === 'user' ? 'text-right text-gray-400' : 'text-gray-400',
                        )}
                      >
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString('bn-BD', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </p>
                    </div>
                    {msg.role === 'user' && (
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-md text-xs',
                          selectedConversation.user
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                            : 'bg-gradient-to-br from-gray-400 to-gray-500',
                        )}
                      >
                        {getInitials(getCustomerName(selectedConversation))}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Footer */}
              <div className="bg-white border-t border-gray-200 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>
                    Started:{' '}
                    {new Date(selectedConversation.createdAt).toLocaleString('bn-BD', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-violet-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Conversation</h3>
                <p className="text-gray-500">Choose a customer from the left to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
