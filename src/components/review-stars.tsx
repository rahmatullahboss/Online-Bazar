"use client"
import { Star } from 'lucide-react'
import React from 'react'

export function ReviewStars({ value, count = 5, className = '' }: { value: number; count?: number; className?: string }) {
  const full = Math.floor(value)
  const stars = Array.from({ length: count }, (_, i) => i < full)
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {stars.map((filled, i) => (
        <Star key={i} className={`size-4 ${filled ? 'fill-yellow-400 text-yellow-500' : 'text-gray-300'}`} />
      ))}
    </div>
  )
}