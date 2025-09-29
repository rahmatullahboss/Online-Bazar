'use client'

import React from 'react'
import { StackProvider } from '@stackframe/stack'
import { stackClientApp } from '@/stack.config'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <StackProvider app={stackClientApp}>
      {children}
    </StackProvider>
  )
}