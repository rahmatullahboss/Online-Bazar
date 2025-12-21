import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ArrowLeft, ShoppingCart } from 'lucide-react'

import config from '@/payload.config'
import { SiteHeader } from '@/components/site-header'
import { AddToCartButton } from '@/components/add-to-cart-button'

export const dynamic = 'force-dynamic'

async function getWishlist(payload: Awaited<ReturnType<typeof getPayload>>, userId: number) {
  const wishlist = await payload.find({
    collection: 'wishlists',
    where: { user: { equals: userId } },
    depth: 2,
    limit: 1,
  })
  return wishlist.docs[0] || null
}

export default async function WishlistPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login')
  }

  const wishlist = await getWishlist(payload, user.id)
  const items =
    (
      wishlist as {
        items?: Array<{
          item: {
            id: number
            name: string
            price: number
            image?: { url: string }
            imageUrl?: string
          }
        }>
      }
    )?.items || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/30 to-amber-50/30 pb-24 md:pb-8">
      <SiteHeader variant="full" user={user} />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Profile</span>
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-sm text-gray-500">{items.length} saved items</p>
          </div>
        </div>

        {/* Wishlist Items */}
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
              <Heart className="w-10 h-10 text-rose-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Wishlist is Empty</h2>
            <p className="text-gray-500 mb-6">Start adding items you love!</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full font-medium hover:from-rose-600 hover:to-pink-700 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((wishlistItem, index) => {
              const item = wishlistItem.item
              if (!item || typeof item !== 'object') return null

              const imageUrl = item.image?.url || item.imageUrl || ''

              return (
                <div
                  key={item.id || index}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Heart className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/item/${item.id}`}
                      className="hover:text-amber-600 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-800 line-clamp-1">{item.name}</h3>
                    </Link>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      ৳{item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <AddToCartButton
                      item={{
                        id: String(item.id),
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        imageUrl: item.imageUrl,
                      }}
                      compact
                      className="!px-4 !py-2 !rounded-full"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
