import Link from 'next/link'
import React from 'react'

import { JsonLd } from '@/components/JsonLd'
import { getServerSideURL } from '@/utilities/getURL'

export type BreadcrumbItem = {
  label: string
  href?: string
}

/**
 * Renders a flat breadcrumb trail with BreadcrumbList JSON-LD structured data.
 * For hierarchical category pages (which use @payloadcms/plugin-nested-docs),
 * use the breadcrumbs field from the collection instead.
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const serverURL = getServerSideURL()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${serverURL}${item.href}` } : {}),
    })),
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            return (
              <li key={index} className="flex items-center gap-1">
                {index > 0 && <span aria-hidden="true">/</span>}
                {isLast || !item.href ? (
                  <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
                ) : (
                  <Link href={item.href} className="transition-colors hover:text-primary">
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
