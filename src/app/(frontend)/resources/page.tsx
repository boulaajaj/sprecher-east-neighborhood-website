import type { Metadata } from 'next/types'

import React from 'react'
import { toResourceSections } from '@/modules/directory'
import { ResourceCard, findResources } from '@/modules/directory/server'
import { mergeOpenGraph } from '@/platform/seo/mergeOpenGraph'
import { EmptyState } from '@/platform/ui/EmptyState'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function ResourcesPage() {
  const sections = toResourceSections(await findResources())

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">Directory</p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Neighborhood Resources
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Helpful contacts, services, and organizations for Sprecher East residents.
        </p>
      </div>

      <div className="container space-y-16">
        {sections.map(({ category, label, items }) => (
          <section key={category}>
            <h2 className="mb-6 border-b border-border pb-3 text-xl font-semibold text-foreground">
              {label}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
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
