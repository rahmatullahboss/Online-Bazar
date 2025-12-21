import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import React from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  Heart,
  Bell,
  User,
  Package,
  CreditCard,
  Calendar,
  ChevronRight,
  LogOut,
  Settings,
} from 'lucide-react'

import config from '@/payload.config'
import { SiteHeader } from '@/components/site-header'
import ProfileForm from './profile-form'
import { Badge } from '@/components/ui/badge'
import { ShinyButton } from '@/components/ui/shiny-button'

export const dynamic = 'force-dynamic'

// Get user order stats
async function getUserStats(payload: Awaited<ReturnType<typeof getPayload>>, userId: number) {
  const orders = await payload.find({
    collection: 'orders',
    where: { user: { equals: userId } },
    limit: 100,
  })

  const totalOrders = orders.totalDocs
  const totalSpent = orders.docs.reduce((sum, order) => {
    const amount = typeof order.totalAmount === 'number' ? order.totalAmount : 0
    return sum + amount
  }, 0)

  return { totalOrders, totalSpent, recentOrders: orders.docs.slice(0, 3) }
}

export default async function ProfilePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login')
  }

  // Fetch user stats
  const { totalOrders, totalSpent, recentOrders } = await getUserStats(payload, user.id)
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short' })
    : 'N/A'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-rose-50/30 pb-24 md:pb-8">
      <SiteHeader variant="full" user={user} />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Enhanced Profile Header */}
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl shadow-xl p-6 sm:p-8 mb-6 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-2xl">
                {(user.firstName?.[0] || user.email[0]).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Settings className="w-4 h-4 text-gray-600" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left text-white">
              <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Welcome!'}
                </h1>
                <Badge className="bg-white/20 text-white border-white/30 text-xs">✨ Member</Badge>
              </div>
              <p className="text-white/80 text-sm sm:text-base">{user.email}</p>
              {(user as { customerNumber?: string }).customerNumber && (
                <p className="text-white/70 text-sm mt-1">
                  📞 {(user as { customerNumber?: string }).customerNumber}
                </p>
              )}
              <p className="text-white/60 text-xs mt-2 flex items-center justify-center sm:justify-start gap-1">
                <Calendar className="w-3 h-3" />
                Member since {memberSince}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalOrders}</p>
            <p className="text-xs sm:text-sm text-gray-500">Total Orders</p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              ৳{totalSpent.toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">Total Spent</p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">VIP</p>
            <p className="text-xs sm:text-sm text-gray-500">Status</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Link
            href="/my-orders"
            className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-800 text-sm">My Orders</p>
              <p className="text-xs text-gray-400">{totalOrders} orders</p>
            </div>
          </Link>

          <Link
            href="/cart"
            className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-800 text-sm">Cart</p>
              <p className="text-xs text-gray-400">View cart</p>
            </div>
          </Link>

          <Link
            href="/wishlist"
            className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 group-hover:bg-rose-200 flex items-center justify-center transition-colors">
              <Heart className="w-6 h-6 text-rose-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-800 text-sm">Wishlist</p>
              <p className="text-xs text-gray-400">Saved items</p>
            </div>
          </Link>

          <Link
            href="/notifications"
            className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center transition-colors">
              <Bell className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-800 text-sm">Notifications</p>
              <p className="text-xs text-gray-400">Alerts</p>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                Recent Orders
              </h2>
              <Link
                href="/my-orders"
                className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/order/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-amber-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">Order #{order.id}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ৳{(order.totalAmount || 0).toLocaleString()}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'processing'
                            ? 'bg-blue-100 text-blue-700'
                            : order.status === 'shipped'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-500" />
            Profile Settings
          </h2>
          <ProfileForm user={user} />
        </div>

        {/* Sign Out */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
          <form action="/api/users/logout" method="POST">
            <ShinyButton
              type="submit"
              variant="destructive"
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </ShinyButton>
          </form>
          <p className="text-center text-xs text-gray-400 mt-3">
            You will be redirected to the homepage
          </p>
        </div>
      </div>
    </div>
  )
}
