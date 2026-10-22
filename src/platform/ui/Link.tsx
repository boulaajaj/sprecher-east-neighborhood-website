import { cn } from '@/utilities/ui'
import { type VariantProps, cva } from 'class-variance-authority'
import NextLink from 'next/link'
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
        inline: 'font-medium text-primary underline underline-offset-4 hover:text-primary-dark',
        // Header and menu items
        nav: 'inline-flex items-center gap-2 rounded-md font-medium text-foreground hover:bg-secondary hover:text-primary aria-[current=page]:text-primary',
        // Footer and other quiet lists
        muted:
          'inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary aria-[current=page]:text-primary',
        // A single follow-up next to content: "Visit website", "Back to all events"
        // 44 px tall: it stands alone, so it's a touch target (WCAG 2.5.8)
        action:
          'inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline',
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
    <NextLink
      {...rest}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      aria-current={current ? 'page' : undefined}
      className={cn(linkVariants({ variant, size }), iconOnly && 'p-2', className)}
    >
      {iconPosition === 'start' && icon}
      {iconOnly ? <span className="sr-only">{children}</span> : children}
      {iconPosition === 'end' && icon}
      {external && <span className="sr-only">, opens in a new tab</span>}
    </NextLink>
  )
}
