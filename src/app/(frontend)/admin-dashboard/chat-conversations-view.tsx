'use client'

import { useState, useEffect } from 'react'
import {
  Bot,
  User,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export function ChatConversationsView() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/chat-conversations')
      const data = await res.json()
      setConversations(data.docs || [])
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchQuery.toLowerCase()
    const guestName = conv.guestInfo?.name?.toLowerCase() || ''
    const guestPhone = conv.guestInfo?.phone || ''
    const userEmail = conv.user?.email?.toLowerCase() || ''
    const messageContent = conv.messages?.some((m) => m.content.toLowerCase().includes(searchLower))

    return (
      guestName.includes(searchLower) ||
      guestPhone.includes(searchLower) ||
      userEmail.includes(searchLower) ||
      messageContent
    )
  })

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCustomerName = (conv: Conversation) => {
    if (conv.user?.email) return conv.user.email.split('@')[0]
    if (conv.guestInfo?.name) return conv.guestInfo.name
    return 'Unknown Customer'
  }

  const getCustomerBadge = (conv: Conversation) => {
    if (conv.user) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <Mail className="w-3 h-3 mr-1" />
          Logged In
        </Badge>
      )
    }
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200">
        <Phone className="w-3 h-3 mr-1" />
        Guest
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
              <MessageCircle className="text-white w-5 h-5" />
            </div>
            Chat Conversations
            <Badge variant="secondary" className="ml-2">
              {conversations.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-3">
            <Link href="/admin-dashboard/chat-inbox">
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Full Inbox
              </Button>
            </Link>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-40"
              />
            </div>
            <Button variant="outline" size="sm" onClick={fetchConversations} disabled={loading}>
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No conversations found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className="border border-gray-200 rounded-xl overflow-hidden hover:border-violet-300 transition-colors"
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white cursor-pointer"
                  onClick={() => setExpandedId(expandedId === conv.id ? null : conv.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{getCustomerName(conv)}</h3>
                        {getCustomerBadge(conv)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        {conv.guestInfo?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {conv.guestInfo.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(conv.lastMessageAt || conv.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {conv.messageCount || conv.messages?.length || 0} messages
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {expandedId === conv.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Messages */}
                {expandedId === conv.id && conv.messages && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 max-h-96 overflow-y-auto">
                    <div className="space-y-3">
                      {conv.messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'flex gap-3',
                            msg.role === 'user' ? 'justify-end' : 'justify-start',
                          )}
                        >
                          {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div
                            className={cn(
                              'max-w-[70%] rounded-2xl px-4 py-2 text-sm',
                              msg.role === 'user'
                                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-br-md'
                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm',
                            )}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            {msg.timestamp && (
                              <p
                                className={cn(
                                  'text-[10px] mt-1',
                                  msg.role === 'user' ? 'text-white/70' : 'text-gray-400',
                                )}
                              >
                                {new Date(msg.timestamp).toLocaleTimeString('bn-BD', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            )}
                          </div>
                          {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
