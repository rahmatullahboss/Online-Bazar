'use client'

import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AdminStatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  className?: string
}

const variantStyles = {
  default: {
    card: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200',
    icon: 'bg-gray-500',
    value: 'text-gray-700',
    subtitle: 'text-gray-600',
  },
  success: {
    card: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
    icon: 'bg-green-500',
    value: 'text-green-600',
    subtitle: 'text-green-600',
  },
  warning: {
    card: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200',
    icon: 'bg-yellow-500',
    value: 'text-yellow-600',
    subtitle: 'text-yellow-600',
  },
  danger: {
    card: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
    icon: 'bg-red-500',
    value: 'text-red-600',
    subtitle: 'text-red-600',
  },
  info: {
    card: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    icon: 'bg-blue-500',
    value: 'text-blue-600',
    subtitle: 'text-blue-600',
  },
  purple: {
    card: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
    icon: 'bg-purple-500',
    value: 'text-purple-600',
    subtitle: 'text-purple-600',
  },
}

export function AdminStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: AdminStatsCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card className={cn(styles.card, 'hover:shadow-lg transition-all duration-300', className)}>
      <CardHeader className="pb-3">
        <CardTitle className={cn('text-sm font-medium flex items-center gap-2', styles.subtitle)}>
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', styles.icon)}>
            <Icon className="text-white w-4 h-4" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', styles.value)}>{value}</div>
        {subtitle && <div className={cn('text-xs mt-1', styles.subtitle)}>{subtitle}</div>}
        {trend && (
          <div
            className={cn(
              'text-xs mt-2 flex items-center gap-1',
              trend.value >= 0 ? 'text-green-600' : 'text-red-600',
            )}
          >
            <span>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-gray-500">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
