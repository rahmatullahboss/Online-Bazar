import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'

import config from '@/payload.config'
import { SiteHeader } from '@/components/site-header'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import AnalyticsDashboard from '../analytics-dashboard'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
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
        title="Analytics Dashboard"
        description="Business insights and performance metrics"
        iconName="bar-chart"
      />

      <div className="container mx-auto px-4 py-6">
        <AnalyticsDashboard />
      </div>
    </div>
  )
}
