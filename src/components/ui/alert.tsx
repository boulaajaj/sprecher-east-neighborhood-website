import { cn } from '@/utilities/ui'
import React from 'react'

const variants = {
  error: {
    className: 'border-destructive/30 bg-destructive/10 text-destructive',
    role: 'alert' as const,
    'aria-live': 'assertive' as const,
  },
  success: {
    className: 'border-primary/30 bg-primary/10 text-primary',
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
