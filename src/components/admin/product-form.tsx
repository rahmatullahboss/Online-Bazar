'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Package, ImageIcon, Loader2, Upload, DollarSign, Tags, Save } from 'lucide-react'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
}

interface ProductFormProps {
  initialData?: {
    id: string
    name: string
    sku?: string
    shortDescription?: string
    description: string
    price: number
    compareAtPrice?: number
    category?: Category | string
    tags?: string[]
    available: boolean
    featured?: boolean
    image?: { id: string; url: string; alt?: string }
    inventoryManagement?: {
      trackInventory?: boolean
      stock?: number
      lowStockThreshold?: number
      allowBackorders?: boolean
    }
  }
  categories: Category[]
  mode: 'create' | 'edit'
}

export function ProductForm({ initialData, categories, mode }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Form state
  const [name, setName] = useState(initialData?.name || '')
  const [sku, setSku] = useState(initialData?.sku || '')
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [price, setPrice] = useState(initialData?.price?.toString() || '')
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialData?.compareAtPrice?.toString() || '',
  )
  const [category, setCategory] = useState(
    typeof initialData?.category === 'object'
      ? initialData.category.id
      : initialData?.category || '',
  )
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '')
  const [available, setAvailable] = useState(initialData?.available ?? true)
  const [featured, setFeatured] = useState(initialData?.featured ?? false)
  const [trackInventory, setTrackInventory] = useState(
    initialData?.inventoryManagement?.trackInventory ?? true,
  )
  const [stock, setStock] = useState(initialData?.inventoryManagement?.stock?.toString() || '0')
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initialData?.inventoryManagement?.lowStockThreshold?.toString() || '5',
  )
  const [allowBackorders, setAllowBackorders] = useState(
    initialData?.inventoryManagement?.allowBackorders ?? false,
  )
  const [imageId, setImageId] = useState(initialData?.image?.id || '')
  const [imagePreview, setImagePreview] = useState(initialData?.image?.url || '')
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setImageId(data.doc?.id || data.id)
        setImagePreview(data.doc?.url || data.url)
        toast.success('Image uploaded')
      } else {
        toast.error('Failed to upload image')
      }
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !description.trim() || !price) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const body = {
        name: name.trim(),
        sku: sku.trim() || undefined,
        shortDescription: shortDescription.trim() || undefined,
        description: description.trim(),
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        category: category || undefined,
        tags: tags
          ? tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        available,
        featured,
        trackInventory,
        stock: parseInt(stock) || 0,
        lowStockThreshold: parseInt(lowStockThreshold) || 5,
        allowBackorders,
        image: imageId || undefined,
      }

      const url = mode === 'create' ? '/api/products' : `/api/products/${initialData?.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success(mode === 'create' ? 'Product created' : 'Product updated')
        router.push('/admin-dashboard/products')
        router.refresh()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to save product')
      }
    } catch (error) {
      toast.error('Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Product SKU or barcode"
                />
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Brief product highlight"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed product description"
                  rows={6}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (৳) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    min={0}
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="compareAtPrice">Compare at Price (৳)</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="Original price"
                    min={0}
                    step="0.01"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="trackInventory"
                  checked={trackInventory}
                  onCheckedChange={(checked) => setTrackInventory(checked === true)}
                />
                <Label htmlFor="trackInventory">Track inventory</Label>
              </div>

              {trackInventory && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      min={0}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                      min={0}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox
                  id="allowBackorders"
                  checked={allowBackorders}
                  onCheckedChange={(checked) => setAllowBackorders(checked === true)}
                />
                <Label htmlFor="allowBackorders">Allow backorders (sell when out of stock)</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Product Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image src={imagePreview} alt="Product preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageId('')
                        setImagePreview('')
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Upload image</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tags className="w-5 h-5" />
                Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
                <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="available"
                  checked={available}
                  onCheckedChange={(checked) => setAvailable(checked === true)}
                />
                <Label htmlFor="available">Available for purchase</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="featured"
                  checked={featured}
                  onCheckedChange={(checked) => setFeatured(checked === true)}
                />
                <Label htmlFor="featured">Featured product</Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {mode === 'create' ? 'Create Product' : 'Update Product'}
          </Button>
        </div>
      </div>
    </form>
  )
}
