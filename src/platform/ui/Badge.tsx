import { cva, type VariantProps } from 'class-variance-authority'
import React from 'react'

import { cn } from '@/platform/lib/cn'

/*
 * A short label, such as a post's or an event's category (#418). `category` is the pill on cards
 * and plain pages: primary-strong on the primary tint, which the theme contract checks at 4.5:1
 * on the page, a surface and a card (the plain primary text it had was 3.9 to 4.5:1). `on-image`
 * sits on a photo, on a scrim of its own (60%), so it passes even over white (`SCRIM_PAIRS`).
 */
const badgeVariants = cva(
  'inline-flex max-w-full items-center rounded-full px-3 py-1 text-xs font-medium [overflow-wrap:anywhere]',
  {
    variants: {
      variant: {
        category: 'bg-primary/10 text-primary-strong',
        'on-image':
          'border border-on-image/30 bg-scrim/60 tracking-wide text-on-image uppercase backdrop-blur-sm',
      },
    },
    defaultVariants: { variant: 'category' },
  },
)

export type BadgeProps = VariantProps<typeof badgeVariants> & {
  className?: string
  children: React.ReactNode
}

export function Badge({ variant, className, children }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)}>{children}</span>
}

/** Badges in a row that wraps on small screens */
export function BadgeList({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn('flex flex-wrap gap-2', className)}>{children}</div>
}
