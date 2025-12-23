import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'

import config from '@/payload.config'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import SalesReport from '../sales-report'

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
    <>
      <AdminPageHeader
        title="Sales Report"
        description="Daily revenue and sales trends"
        iconName="trending-up"
      />

      <div className="container mx-auto px-4 py-6">
        <SalesReport />
      </div>
    </>
  )
}
