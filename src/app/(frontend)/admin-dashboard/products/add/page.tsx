import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'

import config from '@/payload.config'
import { SiteHeader } from '@/components/site-header'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { ProductForm } from '@/components/admin/product-form'

export const dynamic = 'force-dynamic'

export default async function AddProductPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user || (user as any).role !== 'admin') {
    redirect('/')
  }

  // Fetch categories
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader variant="full" user={user} />

      <AdminPageHeader
        title="Add Product"
        description="Create a new product"
        backLink="/admin-dashboard/products"
      />

      <div className="container mx-auto px-4 py-6">
        <ProductForm
          mode="create"
          categories={categories.docs.map((c: any) => ({ id: c.id, name: c.name }))}
        />
      </div>
    </div>
  )
}
