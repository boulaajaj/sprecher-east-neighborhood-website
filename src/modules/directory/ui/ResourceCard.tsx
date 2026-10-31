import React from 'react'
import { ExternalLink, Phone } from 'lucide-react'

import { Link } from '@/platform/ui'
import { Card, CardFooter, CardTitle } from '@/platform/ui/Card'

import type { ResourceSummary } from '../domain/types'

/** One entry in the resources directory: its name, what it is, and how to reach it. */
export function ResourceCard({ resource }: { resource: ResourceSummary }) {
  return (
    <Card as="article" className="flex flex-col">
      <CardTitle className="mb-1.5 text-base">{resource.title}</CardTitle>
      {resource.description && (
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{resource.description}</p>
      )}
      <CardFooter className="pt-0">
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
      </CardFooter>
    </Card>
  )
}
