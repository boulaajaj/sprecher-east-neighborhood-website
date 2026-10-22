import { cn } from '@/utilities/ui'
import { type VariantProps, cva } from 'class-variance-authority'
import { LoaderCircle } from 'lucide-react'
import NextLink from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

/**
 * The only component that draws a button (docs/ui/component-set.md). A form's submit, a card's
 * action, "Load more" and a toast's action all place a Button; with `href` it renders a link.
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-center font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:not-aria-busy:opacity-60 aria-busy:cursor-progress [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-fill text-primary-foreground hover:bg-primary-fill-hover focus-visible:outline-ring',
        secondary:
          'border border-primary text-primary hover:bg-primary/10 focus-visible:outline-ring',
        accent: 'bg-accent text-accent-foreground hover:bg-accent-dark focus-visible:outline-ring',
        ghost: 'text-foreground hover:bg-surface focus-visible:outline-ring',
        // On a brand band (a data-theme="dark" scope): white fill, or a white outline
        inverse:
          'bg-primary-foreground text-primary-dark hover:bg-primary-foreground/90 focus-visible:outline-primary-foreground',
        'inverse-outline':
          'border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 focus-visible:outline-primary-foreground',
      },
      // Every size is at least 44 px tall on phones (WCAG 2.5.8); `sm` shrinks from md up
      size: {
        sm: 'min-h-11 px-4 text-sm md:min-h-9 md:px-3',
        md: 'min-h-11 px-5 text-base',
        lg: 'min-h-12 px-8 text-base',
        icon: 'size-11 [&_svg]:size-5',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
        mobile: 'w-full sm:w-auto',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md', fullWidth: false },
  },
)

type Look = Omit<VariantProps<typeof buttonVariants>, 'fullWidth'> & {
  /** `'mobile'`: full width below 640 px only */
  fullWidth?: boolean | 'mobile'
  className?: string
  children?: ReactNode
  iconStart?: ReactNode
  iconEnd?: ReactNode
}

type ButtonElementProps = Look &
  Omit<ComponentProps<'button'>, keyof Look> & {
    href?: undefined
    external?: never
    /** Shows a spinner in place of `iconStart`, keeps the width, and blocks a second click */
    loading?: boolean
  }

type ButtonLinkProps = Look &
  Omit<ComponentProps<typeof NextLink>, keyof Look | 'href'> & {
    href: string
    /** Opens in a new tab and tells screen readers so */
    external?: boolean
    loading?: never
  }

export type ButtonProps = ButtonElementProps | ButtonLinkProps

export function Button(props: ButtonProps) {
  return props.href === undefined ? <ButtonElement {...props} /> : <ButtonLink {...props} />
}

function ButtonElement({
  variant,
  size,
  fullWidth,
  className,
  children,
  iconStart,
  iconEnd,
  loading = false,
  disabled,
  type = 'button',
  ...rest
}: ButtonElementProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
    >
      {loading ? (
        <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
      ) : (
        iconStart
      )}
      {children}
      {iconEnd}
    </button>
  )
}

function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  children,
  iconStart,
  iconEnd,
  external = false,
  ...rest
}: ButtonLinkProps) {
  return (
    <NextLink
      {...rest}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
    >
      {iconStart}
      {children}
      {iconEnd}
      {external && <span className="sr-only">, opens in a new tab</span>}
    </NextLink>
  )
}
