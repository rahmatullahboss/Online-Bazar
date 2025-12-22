import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'

import config from '@/payload.config'
import { SiteHeader } from '@/components/site-header'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import SalesReport from '../sales-report'
import { TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SalesReportPage() {
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
        title="Sales Report"
        description="Daily revenue and sales trends"
        icon={TrendingUp}
      />

      <div className="container mx-auto px-4 py-6">
        <SalesReport />
      </div>
    </div>
  )
}
