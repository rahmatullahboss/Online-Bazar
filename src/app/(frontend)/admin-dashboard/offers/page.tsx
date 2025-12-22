'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiZap,
  FiTag,
  FiGift,
  FiPackage,
  FiTruck,
  FiImage,
  FiToggleLeft,
  FiToggleRight,
  FiCalendar,
  FiPercent,
  FiDollarSign,
  FiClock,
} from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Offer {
  id: string
  name: string
  type: 'flash_sale' | 'category_sale' | 'buy_x_get_y' | 'bundle' | 'free_shipping' | 'promo_banner'
  description?: string
  discountType?: 'percent' | 'fixed' | 'free_item'
  discountValue?: number
  startDate: string
  endDate: string
  isActive: boolean
  displayOnHomepage: boolean
  priority: number
  usedCount: number
  usageLimit?: number
  badge?: string
  highlightColor: string
  bannerImage?: { url: string }
  targetProducts?: { id: string; name: string }[]
  targetCategory?: { id: string; name: string }
}

const offerTypeConfig = {
  flash_sale: { icon: FiZap, label: 'Flash Sale', color: 'bg-red-500' },
  category_sale: { icon: FiTag, label: 'Category Sale', color: 'bg-blue-500' },
  buy_x_get_y: { icon: FiGift, label: 'Buy X Get Y', color: 'bg-purple-500' },
  bundle: { icon: FiPackage, label: 'Bundle Deal', color: 'bg-green-500' },
  free_shipping: { icon: FiTruck, label: 'Free Shipping', color: 'bg-amber-500' },
  promo_banner: { icon: FiImage, label: 'Promo Banner', color: 'bg-pink-500' },
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/offers?depth=1&limit=100')
      if (res.ok) {
        const data = await res.json()
        setOffers(data.docs || [])
      }
    } catch (error) {
      console.error('Failed to fetch offers:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleOfferStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/offers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      if (res.ok) {
        setOffers(offers.map((o) => (o.id === id ? { ...o, isActive: !currentStatus } : o)))
      }
    } catch (error) {
      console.error('Failed to toggle offer:', error)
    }
  }

  const deleteOffer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return
    try {
      const res = await fetch(`/api/offers/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setOffers(offers.filter((o) => o.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete offer:', error)
    }
  }

  const isExpired = (endDate: string) => new Date(endDate) < new Date()
  const isUpcoming = (startDate: string) => new Date(startDate) > new Date()

  const getStatus = (offer: Offer) => {
    if (!offer.isActive) return { label: 'Inactive', color: 'bg-gray-400' }
    if (isExpired(offer.endDate)) return { label: 'Expired', color: 'bg-red-400' }
    if (isUpcoming(offer.startDate)) return { label: 'Scheduled', color: 'bg-blue-400' }
    return { label: 'Active', color: 'bg-green-500' }
  }

  const filteredOffers = offers.filter((offer) => {
    // Status filter
    if (filter === 'active' && (!offer.isActive || isExpired(offer.endDate))) return false
    if (filter === 'inactive' && offer.isActive) return false
    if (filter === 'expired' && !isExpired(offer.endDate)) return false
    // Type filter
    if (typeFilter !== 'all' && offer.type !== typeFilter) return false
    return true
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTimeRemaining = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now()
    if (diff <= 0) return 'Ended'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days}d ${hours % 24}h left`
    return `${hours}h left`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Offers & Promotions</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage promotional offers for your store
          </p>
        </div>
        <Link href="/admin-dashboard/offers/create">
          <Button className="bg-gradient-to-r from-amber-500 to-rose-500 text-white">
            <FiPlus className="mr-2" /> Create Offer
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiZap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {offers.filter((o) => o.isActive && !isExpired(o.endDate)).length}
              </p>
              <p className="text-xs text-gray-500">Active Offers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiCalendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {offers.filter((o) => isUpcoming(o.startDate)).length}
              </p>
              <p className="text-xs text-gray-500">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FiPercent className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {offers.reduce((sum, o) => sum + o.usedCount, 0)}
              </p>
              <p className="text-xs text-gray-500">Total Uses</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FiClock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {offers.filter((o) => isExpired(o.endDate)).length}
              </p>
              <p className="text-xs text-gray-500">Expired</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['all', 'active', 'inactive', 'expired'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm bg-white"
        >
          <option value="all">All Types</option>
          {Object.entries(offerTypeConfig).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
          <p className="text-gray-500 mt-2">Loading offers...</p>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiGift className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No offers found</h3>
          <p className="text-gray-500 mb-4">Create your first promotional offer to boost sales</p>
          <Link href="/admin-dashboard/offers/create">
            <Button>
              <FiPlus className="mr-2" /> Create Offer
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOffers.map((offer) => {
            const TypeIcon = offerTypeConfig[offer.type].icon
            const status = getStatus(offer)

            return (
              <div
                key={offer.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Type Icon */}
                  <div
                    className={`p-3 rounded-xl ${offerTypeConfig[offer.type].color} text-white flex-shrink-0`}
                  >
                    <TypeIcon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          {offer.name}
                          {offer.badge && (
                            <Badge className="bg-amber-100 text-amber-700 text-xs">
                              {offer.badge}
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {offerTypeConfig[offer.type].label}
                          {offer.discountValue &&
                            offer.discountType === 'percent' &&
                            ` • ${offer.discountValue}% off`}
                          {offer.discountValue &&
                            offer.discountType === 'fixed' &&
                            ` • ৳${offer.discountValue} off`}
                        </p>
                      </div>
                      <Badge className={`${status.color} text-white text-xs`}>{status.label}</Badge>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3.5 h-3.5" />
                        {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                      </span>
                      {!isExpired(offer.endDate) && offer.isActive && (
                        <span className="flex items-center gap-1 text-amber-600 font-medium">
                          <FiClock className="w-3.5 h-3.5" />
                          {getTimeRemaining(offer.endDate)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FiPercent className="w-3.5 h-3.5" />
                        {offer.usedCount} uses
                        {offer.usageLimit ? ` / ${offer.usageLimit}` : ''}
                      </span>
                    </div>

                    {/* Banner Preview */}
                    {offer.type === 'promo_banner' && offer.bannerImage?.url && (
                      <div className="mt-3 rounded-lg overflow-hidden h-20 w-full max-w-md">
                        <Image
                          src={offer.bannerImage.url}
                          alt={offer.name}
                          width={400}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleOfferStatus(offer.id, offer.isActive)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title={offer.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {offer.isActive ? (
                        <FiToggleRight className="w-5 h-5 text-green-500" />
                      ) : (
                        <FiToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <Link href={`/admin-dashboard/offers/${offer.id}/edit`}>
                      <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <FiEdit2 className="w-5 h-5 text-gray-600" />
                      </button>
                    </Link>
                    <button
                      onClick={() => deleteOffer(offer.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <FiTrash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
