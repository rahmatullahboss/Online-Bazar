'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  length?: number
  onComplete: (otp: string) => void
  onChange?: (otp: string) => void
  disabled?: boolean
  className?: string
}

export function OTPInput({
  length = 6,
  onComplete,
  onChange,
  disabled = false,
  className,
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''))
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    const otpString = newOtp.join('')
    onChange?.(otpString)

    if (otpString.length === length) {
      onComplete(otpString)
    } else if (value && index < length - 1) {
      // Move to next input
      inputRefs.current[index + 1]?.focus()
      setActiveIndex(index + 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        // Clear current input
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
        onChange?.(newOtp.join(''))
      } else if (index > 0) {
        // Move to previous input and clear it
        const newOtp = [...otp]
        newOtp[index - 1] = ''
        setOtp(newOtp)
        onChange?.(newOtp.join(''))
        inputRefs.current[index - 1]?.focus()
        setActiveIndex(index - 1)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setActiveIndex(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setActiveIndex(index + 1)
    } else if (e.key === 'Delete') {
      const newOtp = [...otp]
      newOtp[index] = ''
      setOtp(newOtp)
      onChange?.(newOtp.join(''))
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)

    if (pastedData.length > 0) {
      const newOtp = [...otp]
      for (let i = 0; i < pastedData.length && i < length; i++) {
        newOtp[i] = pastedData[i]
      }
      setOtp(newOtp)

      const otpString = newOtp.join('')
      onChange?.(otpString)

      if (otpString.length === length) {
        onComplete(otpString)
      }

      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex((digit, index) => !digit && index < length)
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1
      inputRefs.current[focusIndex]?.focus()
      setActiveIndex(focusIndex)
    }
  }

  const handleFocus = (index: number) => {
    setActiveIndex(index)
  }

  const handleClick = (index: number) => {
    inputRefs.current[index]?.focus()
    setActiveIndex(index)
  }

  // Clear OTP when disabled
  useEffect(() => {
    if (disabled) {
      setOtp(new Array(length).fill(''))
      onChange?.('')
    }
  }, [disabled, length, onChange])

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          onClick={() => handleClick(index)}
          disabled={disabled}
          className={cn(
            'w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'transition-all duration-200',
            digit
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : activeIndex === index
                ? 'border-blue-300 bg-white'
                : 'border-gray-300 bg-white',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
            'hover:border-blue-400',
          )}
        />
      ))}
    </div>
  )
}
