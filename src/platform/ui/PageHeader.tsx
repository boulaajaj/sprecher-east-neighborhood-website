import { ArrowLeft } from 'lucide-react'
import React from 'react'

import { cn } from '@/platform/lib/cn'

import { Link } from './Link'
import { Text } from './Text'

type HeaderBase = {
  /** The page's one `h1` */
  title: React.ReactNode
  /** One or two sentences on what the page holds */
  description?: React.ReactNode
  className?: string
}

/** Heads a list page */
type DefaultHeaderProps = HeaderBase & {
  variant?: 'default'
  /** A short label above the title: the section ("News") or a `Badge` */
  eyebrow?: React.ReactNode
  /** A way back, for a page inside a list: "Back to all events" */
  backLink?: { href: string; label: string }
  /** A control that belongs to the header, such as the search box */
  children?: React.ReactNode
}

/** Heads a page holding one form or message, inside a narrow `Section`: title and description only */
type CompactHeaderProps = HeaderBase & {
  variant: 'compact'
  eyebrow?: never
  backLink?: never
  children?: never
}

export type PageHeaderProps = DefaultHeaderProps | CompactHeaderProps

/*
 * The top of a list page (#430, docs/ui/component-set.md): eyebrow, title, description, an optional
 * way back and an optional control. Left-aligned, the description kept to a readable width. The
 * photo headers of post and event pages (`image`) come with `MetaList`. `compact` is the small
 * header of a form page: title and description only, inside the page's own column.
 */
export function PageHeader(props: PageHeaderProps) {
  if (props.variant === 'compact') {
    const { title, description, className } = props
    return (
      <header className={cn(description ? 'mb-8' : 'mb-6', className)}>
        <h1 className="text-3xl font-bold text-balance text-foreground">{title}</h1>
        {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      </header>
    )
  }

  const { eyebrow, title, description, backLink, children, className } = props
  return (
    <header className={cn('container mb-12 md:mb-16', className)}>
      {eyebrow && (
        <Text variant="overline" as="div" className="mb-3">
          {eyebrow}
        </Text>
      )}
      <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground md:text-5xl">
        {title}
      </h1>
      {description && (
        <Text variant="lead" className="mt-4 max-w-2xl">
          {description}
        </Text>
      )}
      {backLink && (
        <Link
          href={backLink.href}
          variant="action"
          icon={<ArrowLeft aria-hidden="true" />}
          className="mt-4"
        >
          {backLink.label}
        </Link>
      )}
      {children && <div className="mt-6 max-w-[50rem]">{children}</div>}
    </header>
  )
}
