import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { redirect, notFound } from 'next/navigation'

import config from '@/payload.config'
import { SiteHeader } from '@/components/site-header'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { ProductForm } from '@/components/admin/product-form'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user || (user as any).role !== 'admin') {
    redirect('/')
  }

  const { id } = await params

  // Fetch product
  let product
  try {
    product = await payload.findByID({
      collection: 'items',
      id,
      depth: 2,
    })
  } catch (_e) {
    notFound()
  }

  if (!product) {
    notFound()
  }

  // Fetch categories
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
  })

  // Prepare initial data with proper null handling
  const categoryData = product.category
    ? typeof product.category === 'object'
      ? product.category
      : undefined
    : undefined

  const imageData = product.image
    ? typeof product.image === 'object'
      ? {
          id: (product.image as any).id as string,
          url: (product.image as any).url as string,
          alt: (product.image as any).alt as string | undefined,
        }
      : undefined
    : undefined

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader variant="full" user={user} />

      <AdminPageHeader
        title="Edit Product"
        description={product.name}
        backLink="/admin-dashboard/products"
      />

      <div className="container mx-auto px-4 py-6">
        <ProductForm
          mode="edit"
          initialData={{
            id: String(product.id),
            name: product.name,
            sku: product.sku ?? undefined,
            shortDescription: product.shortDescription ?? undefined,
            description: product.description,
            price: product.price,
            compareAtPrice: product.compareAtPrice ?? undefined,
            category: categoryData as any,
            tags: product.tags ?? undefined,
            available: product.available ?? true,
            featured: product.featured ?? undefined,
            image: imageData,
            inventoryManagement: product.inventoryManagement
              ? {
                  trackInventory: product.inventoryManagement.trackInventory ?? undefined,
                  stock: product.inventoryManagement.stock,
                  lowStockThreshold: product.inventoryManagement.lowStockThreshold ?? undefined,
                  allowBackorders: product.inventoryManagement.allowBackorders ?? undefined,
                }
              : undefined,
          }}
          categories={categories.docs.map((c: any) => ({ id: c.id, name: c.name }))}
        />
      </div>
    </div>
  )
}
