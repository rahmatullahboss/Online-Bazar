'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { StockBadge } from '@/components/admin/stock-badge'
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  sku?: string
  price: number
  compareAtPrice?: number
  available: boolean
  featured?: boolean
  image?: { url: string; alt?: string }
  imageUrl?: string
  category?: { id: string; name: string }
  inventoryManagement?: {
    stock: number
    lowStockThreshold: number
    trackInventory: boolean
  }
}

interface Category {
  id: string
  name: string
}

export default function ProductsClient() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocs, setTotalDocs] = useState(0)
  const [editingStock, setEditingStock] = useState<string | null>(null)
  const [stockValue, setStockValue] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const BDT = '\u09F3'
  const fmtBDT = (n: number) => `${BDT}${n.toFixed(0)}`

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (search) params.set('search', search)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      if (stockFilter !== 'all') params.set('stockStatus', stockFilter)

      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()

      if (data.products) {
        setProducts(data.products)
        setTotalPages(data.totalPages || 1)
        setTotalDocs(data.totalDocs || 0)
        if (data.categories) {
          setCategories(data.categories)
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [page, search, categoryFilter, stockFilter])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchProducts()
  }

  const handleDelete = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Product deleted')
        fetchProducts()
      } else {
        toast.error('Failed to delete product')
      }
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const handleStockUpdate = async (productId: string) => {
    const newStock = parseInt(stockValue)
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Invalid stock value')
      return
    }

    setUpdatingId(productId)
    try {
      const res = await fetch('/api/products/stock', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, stock: newStock }),
      })

      if (res.ok) {
        toast.success('Stock updated')
        setEditingStock(null)
        fetchProducts()
      } else {
        toast.error('Failed to update stock')
      }
    } catch (error) {
      toast.error('Failed to update stock')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleToggleAvailable = async (product: Product) => {
    setUpdatingId(product.id)
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !product.available }),
      })

      if (res.ok) {
        toast.success(product.available ? 'Product hidden' : 'Product visible')
        fetchProducts()
      } else {
        toast.error('Failed to update product')
      }
    } catch (error) {
      toast.error('Failed to update product')
    } finally {
      setUpdatingId(null)
    }
  }

  const getProductImage = (product: Product) => {
    if (product.image?.url) return product.image.url
    if (product.imageUrl) return product.imageUrl
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <Button asChild className="gap-2">
          <Link href="/admin-dashboard/products/add">
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-[180px]">
            <Package className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
            <SelectItem value="low-stock">Low Stock</SelectItem>
            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" onClick={() => fetchProducts()} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Products Stats */}
      <div className="text-sm text-gray-500">
        Showing {products.length} of {totalDocs} products
      </div>

      {/* Products List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No products found</p>
            <Button asChild className="mt-4">
              <Link href="/admin-dashboard/products/add">Add Your First Product</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => {
            const imageUrl = getProductImage(product)
            const stock = product.inventoryManagement?.stock ?? 0
            const lowThreshold = product.inventoryManagement?.lowStockThreshold ?? 5

            return (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.image?.alt || product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                        {product.featured && (
                          <Badge className="bg-purple-100 text-purple-800">Featured</Badge>
                        )}
                        {!product.available && (
                          <Badge variant="secondary" className="bg-gray-100">
                            Hidden
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {product.sku && <span>SKU: {product.sku}</span>}
                        {product.category && <span>{product.category.name}</span>}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{fmtBDT(product.price)}</div>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <div className="text-sm text-gray-400 line-through">
                          {fmtBDT(product.compareAtPrice)}
                        </div>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="w-32">
                      {editingStock === product.id ? (
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            value={stockValue}
                            onChange={(e) => setStockValue(e.target.value)}
                            className="w-16 h-8 text-sm"
                            min={0}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleStockUpdate(product.id)}
                            disabled={updatingId === product.id}
                          >
                            {updatingId === product.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              '✓'
                            )}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingStock(null)}>
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingStock(product.id)
                            setStockValue(stock.toString())
                          }}
                          className="hover:opacity-70 transition-opacity"
                        >
                          <StockBadge stock={stock} lowStockThreshold={lowThreshold} />
                        </button>
                      )}
                    </div>

                    {/* Availability Toggle */}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.available}
                        onCheckedChange={() => handleToggleAvailable(product)}
                        disabled={updatingId === product.id}
                      />
                      <span className="text-xs text-gray-500 w-12">
                        {product.available ? 'Active' : 'Hidden'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin-dashboard/products/${product.id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete &quot;{product.name}&quot;. This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(product.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
