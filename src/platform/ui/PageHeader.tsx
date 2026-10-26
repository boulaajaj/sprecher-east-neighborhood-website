import { ArrowLeft } from 'lucide-react'
import React from 'react'

import { cn } from '@/platform/lib/cn'

import { Link } from './Link'

export type PageHeaderProps = {
  /** A short label above the title: the section ("News") or a `Badge` */
  eyebrow?: React.ReactNode
  /** The page's one `h1` */
  title: React.ReactNode
  /** One or two sentences on what the page holds */
  description?: React.ReactNode
  /** A way back, for a page inside a list: "Back to all events" */
  backLink?: { href: string; label: string }
  /** A control that belongs to the header, such as the search box */
  children?: React.ReactNode
  className?: string
}

/*
 * The top of a list page (#430, docs/ui/component-set.md): eyebrow, title, description, an optional
 * way back and an optional control. Left-aligned, the description kept to a readable width. The
 * photo headers of post and event pages (`image`) come with `MetaList`.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  backLink,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('container mb-12 md:mb-16', className)}>
      {eyebrow && (
        <div className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">
          {eyebrow}
        </div>
      )}
      <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground md:text-5xl">
        {title}
      </h1>
      {description && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{description}</p>}
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
