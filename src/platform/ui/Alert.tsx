import { cn } from '@/platform/lib/cn'
import React from 'react'

// The -strong text tokens: plain destructive and primary are under 4.5:1 on their own tints
const variants = {
  error: {
    className: 'border-destructive/30 bg-destructive/10 text-destructive-strong',
    role: 'alert' as const,
    'aria-live': 'assertive' as const,
  },
  success: {
    className: 'border-primary/30 bg-primary/10 text-primary-strong',
    role: 'status' as const,
    'aria-live': 'polite' as const,
  },
}

/**
 * A success or error message. `quiet` leaves out its own live region, for a message shown inside
 * a live region that was already on the page: screen readers announce changes to a region that
 * exists, and may miss one that arrives with its text already in it.
 */
export function Alert({
  variant,
  quiet = false,
  className,
  children,
}: {
  variant: keyof typeof variants
  quiet?: boolean
  className?: string
  children: React.ReactNode
}) {
  const config = variants[variant]

  return (
    <div
      role={quiet ? undefined : config.role}
      aria-live={quiet ? undefined : config['aria-live']}
      aria-atomic={quiet ? undefined : true}
      className={cn('rounded-md border p-3 text-sm', config.className, className)}
    >
      {children}
    </div>
  )
}
