'use client'

import { FiZap, FiClock } from 'react-icons/fi'

interface OfferBadgeProps {
  badge?: string
  type?: string
  highlightColor?: string
  endDate?: string
  size?: 'sm' | 'md'
  showCountdown?: boolean
}

export function OfferBadge({
  badge,
  type,
  highlightColor = 'red',
  endDate,
  size = 'sm',
  showCountdown = false,
}: OfferBadgeProps) {
  if (!badge) return null

  const colorClasses: Record<string, string> = {
    red: 'bg-red-500 text-white',
    orange: 'bg-orange-500 text-white',
    yellow: 'bg-yellow-400 text-gray-900',
    green: 'bg-green-500 text-white',
    blue: 'bg-blue-500 text-white',
    purple: 'bg-purple-500 text-white',
  }

  const bgColor = colorClasses[highlightColor] || colorClasses.red
  const sizeClasses =
    size === 'sm' ? 'text-[9px] sm:text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'

  const getTimeRemaining = () => {
    if (!endDate) return null
    const diff = new Date(endDate).getTime() - Date.now()
    if (diff <= 0) return null
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days}d`
    return `${hours}h`
  }

  const timeLeft = showCountdown ? getTimeRemaining() : null

  return (
    <div
      className={`inline-flex items-center gap-1 ${bgColor} ${sizeClasses} rounded-full font-semibold shadow-lg animate-pulse-subtle`}
    >
      {type === 'flash_sale' && <FiZap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
      <span>{badge}</span>
      {timeLeft && (
        <span className="flex items-center gap-0.5 opacity-90">
          <FiClock className="w-2 h-2" />
          {timeLeft}
        </span>
      )}
    </div>
  )
}
