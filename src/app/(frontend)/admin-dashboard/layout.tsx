import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { AdminSidebar } from './admin-sidebar'
import { SiteHeader } from '@/components/site-header'

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader variant="full" user={user ?? undefined} />
      <AdminSidebar />
      <main className="md:ml-64 transition-all duration-300">{children}</main>
    </div>
  )
}
