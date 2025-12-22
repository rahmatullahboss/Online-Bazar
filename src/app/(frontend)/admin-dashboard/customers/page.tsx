import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import config from '@/payload.config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SiteHeader } from '@/components/site-header'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Button } from '@/components/ui/button'
import { Users, Mail, Phone, Calendar, ShoppingBag, Crown, User, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user || (user as any).role !== 'admin') {
    redirect('/')
  }

  const params = await searchParams
  const typeFilter = params.type || 'all'

  // Fetch all users
  const users = await payload.find({
    collection: 'users',
    depth: 1,
    limit: 100,
    sort: '-createdAt',
  })

  // Fetch orders to get customer order counts
  const allOrders = await payload.find({
    collection: 'orders',
    depth: 1,
    limit: 500,
  })

  // Calculate stats
  const registeredUsers = users.docs.filter((u: any) => u.role === 'user')
  const adminUsers = users.docs.filter((u: any) => u.role === 'admin')

  // Get unique guest customers from orders
  const guestOrders = allOrders.docs.filter((o: any) => !o.user)
  const uniqueGuestEmails = new Set(guestOrders.map((o: any) => o.customerEmail).filter(Boolean))

  // Get order count per registered user
  const userOrderCounts: Record<string, number> = {}
  allOrders.docs.forEach((order: any) => {
    if (order.user) {
      const userId = typeof order.user === 'object' ? order.user.id : order.user
      userOrderCounts[userId] = (userOrderCounts[userId] || 0) + 1
    }
  })

  // Filter users based on type
  let filteredUsers = registeredUsers
  if (typeFilter === 'admin') {
    filteredUsers = adminUsers
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader variant="full" user={user} />

      <AdminPageHeader
        title="Customer Management"
        description={`${users.totalDocs} total users`}
        icon={Users}
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/collections/users">
              <ExternalLink className="w-4 h-4 mr-2" />
              Payload Admin
            </Link>
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <User className="w-4 h-4" /> Registered Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{registeredUsers.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <Crown className="w-4 h-4" /> Admins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{adminUsers.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Guest Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{guestOrders.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <Users className="w-4 h-4" /> Unique Guests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{uniqueGuestEmails.size}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Link href="/admin-dashboard/customers?type=all">
            <Button variant={typeFilter === 'all' ? 'default' : 'outline'} size="sm">
              All Users
              <Badge variant="secondary" className="ml-2">
                {registeredUsers.length}
              </Badge>
            </Button>
          </Link>
          <Link href="/admin-dashboard/customers?type=admin">
            <Button variant={typeFilter === 'admin' ? 'default' : 'outline'} size="sm">
              Admins
              <Badge variant="secondary" className="ml-2">
                {adminUsers.length}
              </Badge>
            </Button>
          </Link>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              {typeFilter === 'admin' ? 'Admin Users' : 'Registered Users'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((u: any) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                          u.role === 'admin'
                            ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                            : 'bg-gradient-to-br from-blue-500 to-blue-600'
                        }`}
                      >
                        {(u.firstName || u.email || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {u.firstName} {u.lastName}
                          {u.role === 'admin' && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              Admin
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {u.email}
                          </span>
                          {u.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {u.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {userOrderCounts[u.id] || 0} orders
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Joined {formatDate(u.createdAt)}
                          </div>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/collections/users/${u.id}`}>
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guest Orders Section */}
        {guestOrders.length > 0 && typeFilter === 'all' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                Recent Guest Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {guestOrders.slice(0, 10).map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">Order #{String(order.id).slice(-8)}</Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(order.orderDate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
