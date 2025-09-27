import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CartButton } from '@/components/cart-button'
import { LogoutButton } from '@/components/logout-button'
import { UserProfile } from '@/components/user-profile'
import { StackLogoutButton } from '@/components/stack-logout-button'
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
  // Since we're not using StackProvider, we'll set stackUser to null
  const stackUser = null
  
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
              {user || stackUser ? (
                <>
                  <div className="hidden sm:flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      Welcome, {user?.firstName || user?.email || 'User'}
                    </span>
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/program">Program</Link>
                    </Button>
                    {/* Updated Products button for logged-in users to point to the new products page */}
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/products">Products</Link>
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserProfile />
                    {user ? <LogoutButton /> : <StackLogoutButton />}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/register">Register</Link>
                  </Button>
                </div>
              )}
              <CartButton />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <MenuIcon className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/">Home</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/products">Products</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/program">Program</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/blog">Blog</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/support">Support</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/my-orders">My Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <LogoutButton />
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/login">Sign In</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/register">Register</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <div className="h-16"></div>
      </>
    )
  }

  return (
    <header className={`w-full border-b border-gray-200/60 bg-white ${className}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {title ? (
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        ) : (
          <Link href="/" className="text-xl font-bold text-gray-900">
            Online Bazar
          </Link>
        )}
        <div className="flex items-center gap-4">
          <CartButton />
        </div>
      </div>
    </header>
  )
}