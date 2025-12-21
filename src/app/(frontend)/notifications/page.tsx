import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import React from 'react'
import Link from 'next/link'
import { Bell, ArrowLeft, Check, Package, Tag, Megaphone } from 'lucide-react'

import config from '@/payload.config'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login')
  }

  // Sample notifications - in real app, fetch from database
  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'Order Shipped!',
      message: 'Your order #123 has been shipped and is on its way.',
      time: '2 hours ago',
      read: false,
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 2,
      type: 'promo',
      title: '50% Off Sale!',
      message: 'Flash sale on electronics. Limited time offer!',
      time: '1 day ago',
      read: true,
      icon: Tag,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      id: 3,
      type: 'announcement',
      title: 'Welcome to Online Bazar!',
      message: 'Thank you for joining. Enjoy shopping!',
      time: '3 days ago',
      read: true,
      icon: Megaphone,
      color: 'bg-green-100 text-green-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-rose-50/30 pb-24 md:pb-8">
      <SiteHeader variant="full" user={user} />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Back Button */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Profile</span>
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500">
                {notifications.filter((n) => !n.read).length} unread
              </p>
            </div>
          </div>
          <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            Mark all read
          </button>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <Bell className="w-10 h-10 text-amber-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Notifications</h2>
            <p className="text-gray-500">You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = notification.icon
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-2xl shadow-sm border p-4 flex items-start gap-4 transition-all ${
                    notification.read ? 'border-gray-100' : 'border-amber-200 bg-amber-50/50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                      {!notification.read && (
                        <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <button className="text-gray-400 hover:text-green-600 transition-colors p-1">
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Push Notification Settings */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-700">Push Notifications</p>
                <p className="text-sm text-gray-500">Get notified about orders and offers</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                defaultChecked
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-700">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive updates via email</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                defaultChecked
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-700">Promotional Offers</p>
                <p className="text-sm text-gray-500">Special deals and discounts</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
