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

export function Alert({
  variant,
  className,
  children,
}: {
  variant: keyof typeof variants
  className?: string
  children: React.ReactNode
}) {
  const config = variants[variant]

  return (
    <div
      role={config.role}
      aria-live={config['aria-live']}
      aria-atomic="true"
      className={cn('rounded-md border p-3 text-sm', config.className, className)}
    >
      {children}
    </div>
  )
}
