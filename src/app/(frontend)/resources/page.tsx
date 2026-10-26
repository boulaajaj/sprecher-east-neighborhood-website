import type { Metadata } from 'next/types'

import React from 'react'
import { toResourceSections } from '@/modules/directory'
import { ResourceCard, findResources } from '@/modules/directory/server'
import { mergeOpenGraph } from '@/platform/seo/mergeOpenGraph'
import { CardGrid, CardGridItem } from '@/platform/ui/CardGrid'
import { EmptyState } from '@/platform/ui/EmptyState'
import { PageHeader } from '@/platform/ui/PageHeader'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function ResourcesPage() {
  const sections = toResourceSections(await findResources())

  return (
    <div className="pt-24 pb-24">
      <PageHeader
        eyebrow="Directory"
        title="Neighborhood Resources"
        description="Helpful contacts, services, and organizations for Sprecher East residents."
      />

      <div className="container space-y-16">
        {sections.map(({ category, label, items }) => (
          <section key={category}>
            <h2 className="mb-6 border-b border-border pb-3 text-xl font-semibold text-foreground">
              {label}
            </h2>
            <CardGrid gap="sm">
              {items.map((resource) => (
                <CardGridItem key={resource.id}>
                  <ResourceCard resource={resource} />
                </CardGridItem>
              ))}
            </CardGrid>
          </section>
        ))}

        {sections.length === 0 && (
          <EmptyState title="Resources are being added." description="Check back soon!" />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  const title = 'Neighborhood Resources'
  const description =
    'Contacts, services, and organizations serving the Sprecher East neighborhood in Madison, WI.'

  return {
    title,
    description,
    openGraph: mergeOpenGraph({ title, description }),
  }
}
