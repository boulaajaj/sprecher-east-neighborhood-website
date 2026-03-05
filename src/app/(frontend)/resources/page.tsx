import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { ExternalLink, Phone } from 'lucide-react'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

export const dynamic = 'force-static'
export const revalidate = 600

const categoryLabels: Record<string, string> = {
  'elected-officials': 'Elected Officials',
  'public-safety': 'Public Safety',
  childcare: 'Childcare & Education',
  renting: 'Renting & Housing',
  parks: 'Parks & Recreation',
  community: 'Community Organizations',
  utilities: 'Utilities & Services',
  other: 'Other',
}

export default async function ResourcesPage() {
  const payload = await getPayload({ config: configPromise })

  const resources = await payload.find({
    collection: 'resources',
    depth: 0,
    limit: 200,
    sort: 'order',
    overrideAccess: false,
  })

  // Group resources by category
  const grouped = resources.docs.reduce(
    (acc, resource) => {
      const cat = resource.category || 'other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(resource)
      return acc
    },
    {} as Record<string, typeof resources.docs>,
  )

  const categoryOrder = Object.keys(categoryLabels)

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
        {categoryOrder
          .filter((cat) => grouped[cat]?.length)
          .map((cat) => (
            <section key={cat}>
              <h2 className="mb-6 border-b border-border pb-3 text-xl font-semibold text-foreground">
                {categoryLabels[cat]}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[cat].map((resource) => (
                  <div
                    key={resource.id}
                    className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <h3 className="mb-1.5 font-semibold text-foreground">{resource.title}</h3>
                    {resource.description && (
                      <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                        {resource.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Visit Website
                        </a>
                      )}
                      {resource.phone && (
                        <a
                          href={`tel:${resource.phone}`}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {resource.phone}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

        {Object.keys(grouped).length === 0 && (
          <div className="rounded-2xl border border-border bg-surface p-12 text-center">
            <p className="text-muted-foreground">Resources are being added. Check back soon!</p>
          </div>
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
