import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'

import config from '@/payload.config'
import { SiteHeader } from '@/components/site-header'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import ProductsClient from './products-client'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user || (user as any).role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader variant="full" user={user} />

      <AdminPageHeader
        title="Products"
        description="Manage your product catalog"
        iconName="shopping-bag"
      />

      <div className="container mx-auto px-4 py-6">
        <ProductsClient />
      </div>
    </div>
  )
}
