'use client'

import Link from 'next/link'
import { ArrowLeft, LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminPageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  backLink?: string
}

export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  action,
  backLink = '/admin-dashboard',
}: AdminPageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="gap-2 -ml-2">
            <Link href={backLink}>
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}
