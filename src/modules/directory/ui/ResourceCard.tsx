import React from 'react'
import { ExternalLink, Phone } from 'lucide-react'

import { Link } from '@/platform/ui'

import type { ResourceSummary } from '../domain/types'

/** One entry in the resources directory: its name, what it is, and how to reach it. */
export function ResourceCard({ resource }: { resource: ResourceSummary }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md motion-safe:hover:-translate-y-0.5">
      <h3 className="mb-1.5 font-semibold text-foreground">{resource.title}</h3>
      {resource.description && (
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{resource.description}</p>
      )}
      <div className="flex flex-wrap gap-3">
        {resource.url && (
          <Link
            href={resource.url}
            variant="action"
            external
            icon={<ExternalLink aria-hidden="true" />}
          >
            Visit Website
          </Link>
        )}
        {resource.phone && (
          <Link href={`tel:${resource.phone}`} variant="action" icon={<Phone aria-hidden="true" />}>
            {resource.phone}
          </Link>
        )}
      </div>
    </div>
  )
}
