'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, User, ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/products', icon: ShoppingBag, label: 'Products' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { state, openCart } = useCart()
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  // Hide on admin pages, checkout, and order pages
  const hiddenPaths = ['/admin', '/checkout', '/order/', '/login', '/register']
  if (hiddenPaths.some(path => pathname.startsWith(path))) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive 
                  ? "text-red-600" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
        
        {/* Cart Button */}
        <button
          onClick={openCart}
          className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-gray-500 hover:text-gray-700 transition-colors relative"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">Cart</span>
        </button>
      </div>
    </nav>
  )
}
