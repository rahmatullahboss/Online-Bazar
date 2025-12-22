import { AdminSidebar } from './admin-sidebar'

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="md:ml-64 transition-all duration-300">{children}</main>
    </div>
  )
}
