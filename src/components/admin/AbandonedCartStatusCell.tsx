import { Badge } from '@/components/ui/badge'

interface CellProps {
  cellData: string
}

export const AbandonedCartStatusCell: React.FC<CellProps> = ({ cellData }) => {
  const value = cellData

  let variant: 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined = 'default'
  let className = ''

  switch (value) {
    case 'active':
      variant = 'default'
      className = 'bg-green-100 text-green-800 border-green-200'
      break
    case 'abandoned':
      variant = 'destructive'
      className = 'bg-red-100 text-red-800 border-red-200'
      break
    case 'recovered':
      variant = 'secondary'
      className = 'bg-blue-100 text-blue-800 border-blue-200'
      break
  }

  return (
    <Badge variant={variant} className={className}>
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </Badge>
  )
}
