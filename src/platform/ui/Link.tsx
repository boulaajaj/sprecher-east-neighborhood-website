import { cn } from '@/utilities/ui'
import { type VariantProps, cva } from 'class-variance-authority'
import type NextLink from 'next/link'

import { AppLink } from './AppLink'
import type { ComponentProps, ReactNode } from 'react'

/**
 * Every text link (docs/ui/component-set.md). A link only ever looks like text; anything that looks
 * like a button is a `Button` with `href`. The current page is styled from `aria-current`, so
 * `current` sets both the look and what assistive tech hears.
 */
export const linkVariants = cva(
  'rounded-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // In running text
        // primary-strong: plain primary is 4.33:1 when the text sits on a surface panel
        inline: 'font-medium text-primary-strong underline underline-offset-4 hover:decoration-2',
        // Header and menu items
        // Hover and current use primary-strong: plain primary is 4.33:1 on the secondary fill
        nav: 'inline-flex items-center gap-2 rounded-md font-medium text-foreground hover:bg-secondary hover:text-primary-strong aria-[current=page]:text-primary-strong',
        // Footer and other quiet lists
        muted:
          'inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary-strong aria-[current=page]:text-primary-strong',
        // A single follow-up next to content: "Visit website", "Back to all events"
        // 44 px tall: it stands alone, so it's a touch target (WCAG 2.5.8). primary-strong because
        // it often sits on a surface panel, where plain primary is 4.33:1
        action:
          'inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary-strong underline-offset-4 hover:underline',
      },
      // For `nav`: `sm` sits in the desktop bar, `md` is a full-width row in the mobile menu
      size: {
        sm: '',
        md: '',
      },
    },
    compoundVariants: [
      { variant: 'nav', size: 'sm', className: 'px-3 py-2 text-sm whitespace-nowrap' },
      {
        variant: 'nav',
        size: 'md',
        className:
          'min-h-11 w-full px-3 py-2.5 text-base aria-[current=page]:bg-secondary [&_svg]:size-5',
      },
    ],
    defaultVariants: { variant: 'inline', size: 'md' },
  },
)

export type LinkProps = Omit<ComponentProps<typeof NextLink>, 'href' | 'className'> &
  VariantProps<typeof linkVariants> & {
    href: string
    className?: string
    /** Opens in a new tab and tells screen readers so */
    external?: boolean
    /** This link is the page being shown: `aria-current="page"` and the active look */
    current?: boolean
    icon?: ReactNode
    iconPosition?: 'start' | 'end'
    /** Shows only the icon; the text stays for screen readers */
    iconOnly?: boolean
  }

export function Link({
  variant,
  size,
  className,
  external = false,
  current = false,
  icon,
  iconPosition = 'start',
  iconOnly = false,
  children,
  ...rest
}: LinkProps) {
  return (
    <AppLink
      {...rest}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      aria-current={current ? 'page' : undefined}
      className={cn(linkVariants({ variant, size }), iconOnly && 'p-2 [&_svg]:size-5', className)}
    >
      {iconPosition === 'start' && icon}
      {iconOnly ? <span className="sr-only">{children}</span> : children}
      {iconPosition === 'end' && icon}
      {external && <span className="sr-only">, opens in a new tab</span>}
    </AppLink>
  )
}
