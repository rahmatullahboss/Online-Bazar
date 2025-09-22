'use client'

import React from 'react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

export const ShinyButton: React.FC<ShinyButtonProps> = ({
  children,
  className,
  onClick,
  disabled,
  type,
  ...props
}) => {
  return (
    <motion.button
      initial={{ '--x': '100%' } as any}
      animate={{ '--x': '-100%' } as any}
      whileTap={{ scale: 0.97 }}
      transition={{
        repeat: Infinity,
        repeatType: 'loop',
        duration: 2,
        ease: 'linear',
      }}
      whileHover={{
        scale: 1.05,
        transition: {
          duration: 0.3,
          ease: 'easeOut',
        },
      }}
      className={cn(
        'relative rounded-lg px-6 py-2 font-medium backdrop-blur-xl transition-shadow duration-300 ease-in-out hover:shadow dark:bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/10%)_0%,transparent_60%)] dark:hover:shadow-[0_0_20px_hsl(var(--primary)/10%)]',
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      <span
        className="relative block size-full text-sm uppercase tracking-wide text-[rgb(0,0,0,65%)] dark:font-light dark:text-[rgb(255,255,255,90%)]"
        style={{
          maskImage:
            'linear-gradient(-75deg,hsl(var(--primary)) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),hsl(var(--primary)) calc(var(--x) + 100%))',
        }}
      >
        {children}
      </span>
      <span
        style={{
          mask: 'linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box,linear-gradient(rgb(0,0,0), rgb(0,0,0))',
          maskComposite: 'exclude',
        }}
        className="absolute inset-0 z-10 block rounded-[inherit] bg-[linear-gradient(-75deg,hsl(var(--primary)/10%)_calc(var(--x)+20%),hsl(var(--primary)/50%)_calc(var(--x)+25%),hsl(var(--primary)/10%)_calc(var(--x)+100%))] p-px"
      ></span>
    </motion.button>
  )
}
