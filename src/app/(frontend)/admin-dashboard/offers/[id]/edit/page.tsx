'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiArrowLeft,
  FiSave,
  FiZap,
  FiTag,
  FiGift,
  FiPackage,
  FiTruck,
  FiImage,
  FiCalendar,
} from 'react-icons/fi'
import { Button } from '@/components/ui/button'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
}

const offerTypes = [
  {
    value: 'flash_sale',
    label: 'Flash Sale',
    icon: FiZap,
    color: 'bg-red-500',
    description: 'Time-limited discount on products',
  },
  {
    value: 'category_sale',
    label: 'Category Sale',
    icon: FiTag,
    color: 'bg-blue-500',
    description: 'Discount on entire category',
  },
  {
    value: 'buy_x_get_y',
    label: 'Buy X Get Y',
    icon: FiGift,
    color: 'bg-purple-500',
    description: 'Buy products, get free/discounted items',
  },
  {
    value: 'bundle',
    label: 'Bundle Deal',
    icon: FiPackage,
    color: 'bg-green-500',
    description: 'Combine products for special price',
  },
  {
    value: 'free_shipping',
    label: 'Free Shipping',
    icon: FiTruck,
    color: 'bg-amber-500',
    description: 'Free shipping on specific products',
  },
  {
    value: 'promo_banner',
    label: 'Promo Banner',
    icon: FiImage,
    color: 'bg-pink-500',
    description: 'Promotional banner for homepage',
  },
]

export default function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingOffer, setLoadingOffer] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'flash_sale',
    discountType: 'percent',
    discountValue: 10,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    isActive: true,
    displayOnHomepage: false,
    priority: 0,
    targetType: 'all',
    targetProducts: [] as string[],
    targetCategory: '',
    buyQuantity: 2,
    getQuantity: 1,
    bundleProducts: [] as string[],
    bundlePrice: 0,
    bannerLink: '',
    bannerText: '',
    minOrderValue: 0,
    usageLimit: 0,
    badge: '',
    highlightColor: 'red',
  })

  useEffect(() => {
    fetchOffer()
    fetchCategories()
    fetchProducts()
  }, [id])

  const fetchOffer = async () => {
    try {
      const res = await fetch(`/api/offers/${id}?depth=1`)
      if (res.ok) {
        const offer = await res.json()
        setFormData({
          name: offer.name || '',
          description: offer.description || '',
          type: offer.type || 'flash_sale',
          discountType: offer.discountType || 'percent',
          discountValue: offer.discountValue || 10,
          startDate: offer.startDate
            ? new Date(offer.startDate).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          endDate: offer.endDate
            ? new Date(offer.endDate).toISOString().slice(0, 16)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          isActive: offer.isActive ?? true,
          displayOnHomepage: offer.displayOnHomepage ?? false,
          priority: offer.priority || 0,
          targetType: offer.targetType || 'all',
          targetProducts: (offer.targetProducts || []).map((p: any) =>
            typeof p === 'object' ? p.id : p,
          ),
          targetCategory:
            typeof offer.targetCategory === 'object'
              ? offer.targetCategory?.id
              : offer.targetCategory || '',
          buyQuantity: offer.bogoSettings?.buyQuantity || 2,
          getQuantity: offer.bogoSettings?.getQuantity || 1,
          bundleProducts: (offer.bundleProducts || []).map((p: any) =>
            typeof p === 'object' ? p.id : p,
          ),
          bundlePrice: offer.bundlePrice || 0,
          bannerLink: offer.bannerLink || '',
          bannerText: offer.bannerText || '',
          minOrderValue: offer.minOrderValue || 0,
          usageLimit: offer.usageLimit || 0,
          badge: offer.badge || '',
          highlightColor: offer.highlightColor || 'red',
        })
      }
    } catch (error) {
      console.error('Failed to fetch offer:', error)
    } finally {
      setLoadingOffer(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?limit=100')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.docs || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/items?limit=100')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.docs || [])
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const offerData: Record<string, unknown> = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
        displayOnHomepage: formData.displayOnHomepage,
        priority: formData.priority,
        minOrderValue: formData.minOrderValue,
        usageLimit: formData.usageLimit,
        badge: formData.badge,
        highlightColor: formData.highlightColor,
      }

      if (formData.type !== 'promo_banner' && formData.type !== 'free_shipping') {
        offerData.discountType = formData.discountType
        offerData.discountValue = formData.discountValue
      }

      if (formData.type !== 'promo_banner') {
        offerData.targetType = formData.targetType
        if (formData.targetType === 'specific_products') {
          offerData.targetProducts = formData.targetProducts
        }
        if (formData.targetType === 'category') {
          offerData.targetCategory = formData.targetCategory
        }
      }

      if (formData.type === 'buy_x_get_y') {
        offerData.bogoSettings = {
          buyQuantity: formData.buyQuantity,
          getQuantity: formData.getQuantity,
        }
      }

      if (formData.type === 'bundle') {
        offerData.bundleProducts = formData.bundleProducts
        offerData.bundlePrice = formData.bundlePrice
      }

      if (formData.type === 'promo_banner') {
        offerData.bannerLink = formData.bannerLink
        offerData.bannerText = formData.bannerText
      }

      const res = await fetch(`/api/offers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData),
      })

      if (res.ok) {
        router.push('/admin-dashboard/offers')
      } else {
        const error = await res.json()
        alert(`Failed to update offer: ${error.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to update offer:', error)
      alert('Failed to update offer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedType = offerTypes.find((t) => t.value === formData.type)
  const TypeIcon = selectedType?.icon || FiZap

  if (loadingOffer) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-100 rounded-xl"></div>
          <div className="h-48 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin-dashboard/offers">
          <Button variant="ghost" size="sm">
            <FiArrowLeft className="mr-2" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Offer</h1>
          <p className="text-gray-500 text-sm">Update the promotional offer settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Offer Type Selection */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Offer Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {offerTypes.map((type) => {
              const Icon = type.icon
              const isSelected = formData.type === type.value
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${type.color} text-white flex items-center justify-center mb-2`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="font-medium text-gray-800 text-sm">{type.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${selectedType?.color} text-white`}>
              <TypeIcon className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-gray-800">Offer Details</h2>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Offer Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Flash Sale - 50% Off Electronics"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this offer..."
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Discount Settings */}
            {formData.type !== 'promo_banner' && formData.type !== 'free_shipping' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="percent">Percentage Off</option>
                    <option value="fixed">Fixed Amount Off</option>
                    {formData.type === 'buy_x_get_y' && (
                      <option value="free_item">Free Item</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.discountType === 'percent' ? 'Percentage (%)' : 'Amount (৳)'}
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: Number(e.target.value) })
                    }
                    min={0}
                    max={formData.discountType === 'percent' ? 100 : undefined}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* BOGO Settings */}
            {formData.type === 'buy_x_get_y' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buy Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.buyQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, buyQuantity: Number(e.target.value) })
                    }
                    min={1}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Get Free/Discounted
                  </label>
                  <input
                    type="number"
                    value={formData.getQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, getQuantity: Number(e.target.value) })
                    }
                    min={1}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                  />
                </div>
              </div>
            )}

            {/* Bundle Price */}
            {formData.type === 'bundle' && (
              <div className="p-4 bg-green-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bundle Price (৳)
                </label>
                <input
                  type="number"
                  value={formData.bundlePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, bundlePrice: Number(e.target.value) })
                  }
                  min={0}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                  placeholder="Special price for the bundle"
                />
              </div>
            )}

            {/* Promo Banner Settings */}
            {formData.type === 'promo_banner' && (
              <div className="grid gap-4 p-4 bg-pink-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banner Link URL
                  </label>
                  <input
                    type="text"
                    value={formData.bannerLink}
                    onChange={(e) => setFormData({ ...formData, bannerLink: e.target.value })}
                    placeholder="/products or /offers"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banner Text
                  </label>
                  <input
                    type="text"
                    value={formData.bannerText}
                    onChange={(e) => setFormData({ ...formData, bannerText: e.target.value })}
                    placeholder="Text overlay on banner"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500 text-white">
              <FiCalendar className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-gray-800">Schedule</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Targeting */}
        {formData.type !== 'promo_banner' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">Product Targeting</h2>

            <div className="space-y-4">
              <div className="flex gap-2">
                {(['all', 'specific_products', 'category'] as const).map((target) => (
                  <button
                    key={target}
                    type="button"
                    onClick={() => setFormData({ ...formData, targetType: target })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.targetType === target
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {target === 'all' && 'All Products'}
                    {target === 'specific_products' && 'Specific Products'}
                    {target === 'category' && 'Category'}
                  </button>
                ))}
              </div>

              {formData.targetType === 'category' && (
                <select
                  value={formData.targetCategory}
                  onChange={(e) => setFormData({ ...formData, targetCategory: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}

              {(formData.targetType === 'specific_products' || formData.type === 'bundle') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.type === 'bundle' ? 'Bundle Products' : 'Select Products'}
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                    {products.map((product) => {
                      const targetArray =
                        formData.type === 'bundle'
                          ? formData.bundleProducts
                          : formData.targetProducts
                      const isSelected = targetArray.includes(product.id)
                      return (
                        <label
                          key={product.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const field =
                                formData.type === 'bundle' ? 'bundleProducts' : 'targetProducts'
                              if (e.target.checked) {
                                setFormData({ ...formData, [field]: [...targetArray, product.id] })
                              } else {
                                setFormData({
                                  ...formData,
                                  [field]: targetArray.filter((id: string) => id !== product.id),
                                })
                              }
                            }}
                            className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                          />
                          <span className="text-sm text-gray-700">{product.name}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Additional Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g., 50% OFF, BOGO"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Highlight Color
              </label>
              <select
                value={formData.highlightColor}
                onChange={(e) => setFormData({ ...formData, highlightColor: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="red">🔴 Red</option>
                <option value="orange">🟠 Orange</option>
                <option value="yellow">🟡 Yellow</option>
                <option value="green">🟢 Green</option>
                <option value="blue">🔵 Blue</option>
                <option value="purple">🟣 Purple</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Order Value (৳)
              </label>
              <input
                type="number"
                value={formData.minOrderValue}
                onChange={(e) =>
                  setFormData({ ...formData, minOrderValue: Number(e.target.value) })
                }
                min={0}
                placeholder="0 for no minimum"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                min={0}
                placeholder="0 for unlimited"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority (0-100)
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                min={0}
                max={100}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.displayOnHomepage}
                onChange={(e) => setFormData({ ...formData, displayOnHomepage: e.target.checked })}
                className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">Display on homepage</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 justify-end">
          <Link href="/admin-dashboard/offers">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-amber-500 to-rose-500 text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FiSave /> Save Changes
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
