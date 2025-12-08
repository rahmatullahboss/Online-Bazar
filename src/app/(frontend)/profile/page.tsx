import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import React from 'react'
import Link from 'next/link'
import { ShoppingBag, Clock, MapPin, User } from 'lucide-react'

import config from '@/payload.config'
import { SiteHeader } from '@/components/site-header'
import ProfileForm from './profile-form'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 md:pb-0">
      <SiteHeader variant="full" user={user} />
      
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
              {(user.firstName?.[0] || user.email[0]).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-800">
                {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Welcome!'}
              </h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              {(user as any).customerNumber && (
                <p className="text-xs text-gray-400 mt-1">📞 {(user as any).customerNumber}</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/my-orders" className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800 text-sm">My Orders</p>
              <p className="text-xs text-gray-500">View history</p>
            </div>
          </Link>
          
          <Link href="/cart" className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800 text-sm">Cart</p>
              <p className="text-xs text-gray-500">Continue shopping</p>
            </div>
          </Link>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Settings
          </h2>
          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  )
}

