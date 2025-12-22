'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  MessageCircle,
  BarChart3,
  Package,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface MenuItem {
  name: string
  href: string
  icon: React.ReactNode
  badge?: string
}

const menuItems: MenuItem[] = [
  {
    name: 'Overview',
    href: '/admin-dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: 'Orders',
    href: '/admin-dashboard#orders',
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    name: 'Chat Inbox',
    href: '/admin-dashboard/chat-inbox',
    icon: <MessageCircle className="w-5 h-5" />,
  },
  {
    name: 'Analytics',
    href: '/admin-dashboard#analytics',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    name: 'Products',
    href: '/admin/collections/items',
    icon: <Package className="w-5 h-5" />,
  },
  {
    name: 'Customers',
    href: '/admin/collections/users',
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: 'Settings',
    href: '/admin',
    icon: <Settings className="w-5 h-5" />,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-20 left-4 z-50 md:hidden bg-white shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-64px)] bg-white border-r border-gray-200 z-50 transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 hidden md:flex"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {/* Logo/Title */}
        <div className={cn('p-4 border-b border-gray-100', collapsed && 'px-3')}>
          {collapsed ? (
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Admin Panel</h2>
                <p className="text-xs text-gray-500">Manage your store</p>
              </div>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin-dashboard' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  collapsed && 'justify-center px-2',
                )}
              >
                <span className={cn(isActive && 'text-white')}>{item.icon}</span>
                {!collapsed && <span className="font-medium text-sm">{item.name}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        {!collapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
              <p className="text-xs text-gray-600 text-center">Online Bazar Admin</p>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
