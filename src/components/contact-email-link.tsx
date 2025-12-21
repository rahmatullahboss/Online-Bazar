'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'
import { SITE_NAME } from '@/lib/site-config'

type ContactEmailLinkProps = {
  className?: string
  label?: string
  loadingLabel?: string
}

const EMAIL_PARTS = ['rahmatullahzisan', 'gmail', 'com'] as const

function buildEmail(parts: typeof EMAIL_PARTS) {
  const [user, domain, tld] = parts
  return `${user}@${domain}.${tld}`
}

export function ContactEmailLink({
  className,
  label,
  loadingLabel = 'Email us',
}: ContactEmailLinkProps) {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    setEmail(buildEmail(EMAIL_PARTS))
  }, [])

  if (!email) {
    return <span className={cn('text-gray-600', className)}>{label ?? loadingLabel}</span>
  }

  return (
    <a
      href={`mailto:${email}`}
      className={cn(
        'transition-colors hover:text-emerald-600 focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50',
        className,
      )}
      aria-label={`Email ${SITE_NAME} at ${email}`}
    >
      {label ?? email}
    </a>
  )
}

export default ContactEmailLink
