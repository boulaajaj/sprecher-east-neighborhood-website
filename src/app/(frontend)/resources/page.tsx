import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
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
        <div className="prose max-w-none">
          <h1>Neighborhood Resources</h1>
          <p className="text-muted-foreground">
            Helpful contacts, services, and organizations for Sprecher East residents.
          </p>
        </div>
      </div>

      <div className="container space-y-12">
        {categoryOrder
          .filter((cat) => grouped[cat]?.length)
          .map((cat) => (
            <section key={cat}>
              <h2 className="mb-6 text-xl font-semibold">{categoryLabels[cat]}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[cat].map((resource) => (
                  <div key={resource.id} className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-1 font-medium">{resource.title}</h3>
                    {resource.description && (
                      <p className="mb-2 text-sm text-muted-foreground">{resource.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Visit Website →
                        </a>
                      )}
                      {resource.phone && (
                        <a
                          href={`tel:${resource.phone}`}
                          className="text-sm text-primary hover:underline"
                        >
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
          <div className="text-center">
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
