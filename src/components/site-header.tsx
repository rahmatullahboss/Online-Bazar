import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CartButton } from '@/components/cart-button'
import { LogoutButton } from '@/components/logout-button'
import { UserProfile } from '@/components/user-profile'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu as MenuIcon } from 'lucide-react'

export interface SiteHeaderProps {
  variant?: 'full' | 'simple'
  user?: any
  title?: string
  subtitle?: string | React.ReactNode
  className?: string
}

export function SiteHeader({
  variant = 'simple',
  user,
  title,
  subtitle,
  className = '',
}: SiteHeaderProps) {
  if (variant === 'full') {
    return (
      <>
        <header
          className={`fixed inset-x-0 top-0 z-50 w-full border-b border-gray-200/60 bg-white/95 sm:bg-white/80 backdrop-blur-none sm:backdrop-blur-2xl ${className}`}
        >
          <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                  🍿
                </span>
                <div className="absolute inset-0 rounded-full blur-sm sm:blur-lg opacity-0 group-hover:opacity-30 sm:group-hover:opacity-40 transition-opacity duration-300 brand-glow"></div>
              </div>
              <h1 className="text-2xl font-bold brand-text tracking-tight">Online Bazar</h1>
            </Link>

            {/* Navigation and User Actions */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      Welcome, {user.firstName || user.email}
                    </span>
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/program">Program</Link>
                    </Button>
                    {/* Updated Products button for logged-in users to point to the new products page */}
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/products">Products</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/blog">Blog</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/support">Support</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/profile">Profile</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/my-orders">My Orders</Link>
                    </Button>
                    {user.role === 'admin' && (
                      <Button asChild variant="ghost" size="sm">
                        <Link href="/admin-dashboard">Admin</Link>
                      </Button>
                    )}
                  </div>
                  {/* Mobile menu */}
                  <div className="sm:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" aria-label="Open menu">
                          <MenuIcon className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href="/program">Program</Link>
                        </DropdownMenuItem>
                        {/* Updated Products link for mobile menu (logged-in users) */}
                        <DropdownMenuItem asChild>
                          <Link href="/products">Products</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/blog">Blog</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/support">Support</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/my-orders">My Orders</Link>
                        </DropdownMenuItem>
                        {user.role === 'admin' && (
                          <DropdownMenuItem asChild>
                            <Link href="/admin-dashboard">Admin</Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/checkout">Checkout</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CartButton />
                  <LogoutButton />
                </>
              ) : (
                <>
                  <div className="hidden sm:flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/program">Program</Link>
                    </Button>
                    {/* Updated Products button for guest users to point to the new products page */}
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/products">Products</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/blog">Blog</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/support">Support</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href="/register">Sign Up</Link>
                    </Button>
                  </div>
                  {/* Mobile menu for guests */}
                  <div className="sm:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" aria-label="Open menu">
                          <MenuIcon className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href="/program">Program</Link>
                        </DropdownMenuItem>
                        {/* Updated Products link for mobile menu (guest users) */}
                        <DropdownMenuItem asChild>
                          <Link href="/products">Products</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/blog">Blog</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/support">Support</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/login">Sign In</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/register">Sign Up</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {/* Cart available for guests too */}
                  <CartButton />
                  <UserProfile />
                </>
              )}
            </div>
          </div>
        </header>
        <div aria-hidden="true" className="h-16 w-full" />
      </>
    )
  }

  // Simple variant (for auth pages, etc.)
  return (
    <div className={`text-center ${className}`}>
      <Link href="/" className="text-2xl font-bold brand-text">
        🍿 Online Bazar
      </Link>
      {title && <h2 className="mt-6 text-3xl font-bold text-gray-900">{title}</h2>}
      {subtitle && <div className="mt-2 text-sm text-gray-600">{subtitle}</div>}
    </div>
  )
}
