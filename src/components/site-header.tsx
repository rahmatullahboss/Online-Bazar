'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CartButton } from '@/components/cart-button'
import { LogoutButton } from '@/components/logout-button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import {
  Menu as MenuIcon,
  Package,
  FileText,
  User,
  ShoppingBag,
  Settings,
  LogIn,
  UserPlus,
  ShoppingCart,
} from 'lucide-react'
import storeConfig from '@/config/store.config'

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
          <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
            {/* Mobile: Left side - Menu button */}
            <div className="flex sm:hidden items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Open menu">
                    <MenuIcon className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                  <SheetHeader className="border-b border-gray-200 p-4">
                    <SheetTitle className="flex items-center gap-2">
                      <span className="text-2xl">{storeConfig.emoji}</span>
                      <span className="font-bold brand-text">{storeConfig.name}</span>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col p-4 gap-1">
                    <SheetClose asChild>
                      <Link
                        href="/products"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Package className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">Products</span>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/blog"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FileText className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">Blog</span>
                      </Link>
                    </SheetClose>
                    <div className="my-2 border-t border-gray-200" />
                    {user ? (
                      <>
                        <SheetClose asChild>
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <User className="h-5 w-5 text-gray-500" />
                            <span className="font-medium">Profile</span>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            href="/my-orders"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <ShoppingBag className="h-5 w-5 text-gray-500" />
                            <span className="font-medium">My Orders</span>
                          </Link>
                        </SheetClose>
                        {user.role === 'admin' && (
                          <SheetClose asChild>
                            <Link
                              href="/admin-dashboard"
                              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Settings className="h-5 w-5 text-gray-500" />
                              <span className="font-medium">Admin</span>
                            </Link>
                          </SheetClose>
                        )}
                        <div className="my-2 border-t border-gray-200" />
                        <SheetClose asChild>
                          <Link
                            href="/checkout"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <ShoppingCart className="h-5 w-5 text-gray-500" />
                            <span className="font-medium">Checkout</span>
                          </Link>
                        </SheetClose>
                      </>
                    ) : (
                      <>
                        <SheetClose asChild>
                          <Link
                            href="/login"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <LogIn className="h-5 w-5 text-gray-500" />
                            <span className="font-medium">Sign In</span>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            href="/register"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <UserPlus className="h-5 w-5 text-gray-500" />
                            <span className="font-medium">Sign Up</span>
                          </Link>
                        </SheetClose>
                      </>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop: Logo on left */}
            <Link href="/" className="hidden sm:flex items-center gap-3 group">
              <div className="relative">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                  {storeConfig.emoji}
                </span>
                <div className="absolute inset-0 rounded-full blur-sm sm:blur-lg opacity-0 group-hover:opacity-30 sm:group-hover:opacity-40 transition-opacity duration-300 brand-glow"></div>
              </div>
              <h1 className="text-2xl font-bold brand-text tracking-tight">{storeConfig.name}</h1>
            </Link>

            {/* Mobile: Centered Logo */}
            <Link
              href="/"
              className="flex-1 flex sm:hidden justify-center items-center gap-2 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                {storeConfig.emoji}
              </span>
              <h1 className="text-xl font-bold brand-text tracking-tight">{storeConfig.name}</h1>
            </Link>

            {/* Desktop: Right side navigation */}
            <div className="hidden sm:flex items-center gap-4 ml-auto">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">
                    Welcome, {user.firstName || user.email}
                  </span>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/products">Products</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/blog">Blog</Link>
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
                  <CartButton />
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/products">Products</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/blog">Blog</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/register">Sign Up</Link>
                  </Button>
                  <CartButton />
                </>
              )}
            </div>

            {/* Mobile: Right side - Cart and Logout */}
            <div className="flex sm:hidden items-center gap-2">
              <CartButton />
              {user && <LogoutButton />}
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
        {storeConfig.emoji} {storeConfig.name}
      </Link>
      {title && <h2 className="mt-6 text-3xl font-bold text-gray-900">{title}</h2>}
      {subtitle && <div className="mt-2 text-sm text-gray-600">{subtitle}</div>}
    </div>
  )
}
