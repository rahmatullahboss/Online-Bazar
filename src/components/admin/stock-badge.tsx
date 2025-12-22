import { Badge } from '@/components/ui/badge'
import { Package, AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StockBadgeProps {
  stock: number
  lowStockThreshold?: number
  className?: string
  showCount?: boolean
}

export function StockBadge({
  stock,
  lowStockThreshold = 5,
  className,
  showCount = true,
}: StockBadgeProps) {
  if (stock <= 0) {
    return (
      <Badge variant="destructive" className={cn('gap-1', className)}>
        <XCircle className="w-3 h-3" />
        Out of Stock
      </Badge>
    )
  }

  if (stock <= lowStockThreshold) {
    return (
      <Badge
        variant="secondary"
        className={cn('bg-amber-100 text-amber-800 border-amber-200 gap-1', className)}
      >
        <AlertTriangle className="w-3 h-3" />
        Low Stock{showCount && ` (${stock})`}
      </Badge>
    )
  }

  return (
    <Badge
      variant="secondary"
      className={cn('bg-green-100 text-green-800 border-green-200 gap-1', className)}
    >
      <Package className="w-3 h-3" />
      In Stock{showCount && ` (${stock})`}
    </Badge>
  )
}
