import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'
import { formatDateTime } from '@/utilities/formatDateTime'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import Link from 'next/link'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const events = await payload.find({
    collection: 'events',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return events.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function EventPage({ params: paramsPromise }: Args) {
  const { isEnabled: _draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/events/' + decodedSlug
  const event = await queryEventBySlug({ slug: decodedSlug })

  if (!event) return <PayloadRedirects url={url} />

  return (
    <article className="pt-24 pb-24">
      <PayloadRedirects disableNotFound url={url} />

      <div className="container max-w-4xl">
        <Link
          href="/events"
          className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          ← Back to Events
        </Link>

        <div className="mb-8">
          {event.category && (
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {event.category}
            </span>
          )}
          <h1 className="mb-4 text-4xl font-bold">{event.title}</h1>

          <div className="flex flex-wrap gap-6 text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Date:</span>{' '}
              {formatDateTime(event.date)}
            </div>
            {event.timeStart && (
              <div>
                <span className="font-medium text-foreground">Time:</span> {event.timeStart}
                {event.timeEnd ? ` – ${event.timeEnd}` : ''}
              </div>
            )}
            {event.locationType && (
              <div>
                <span className="font-medium text-foreground">Format:</span>{' '}
                {event.locationType === 'in-person'
                  ? 'In Person'
                  : event.locationType === 'virtual'
                    ? 'Virtual'
                    : 'Hybrid'}
              </div>
            )}
          </div>
        </div>

        {(event.locationName || event.locationAddress) && (
          <div className="mb-8 rounded-lg border border-border bg-card p-4">
            <h3 className="mb-2 font-semibold">Location</h3>
            {event.locationName && <p>{event.locationName}</p>}
            {event.locationAddress && (
              <p className="text-sm text-muted-foreground">{event.locationAddress}</p>
            )}
            {event.mapsUrl && (
              <a
                href={event.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-primary hover:underline"
              >
                View on Google Maps →
              </a>
            )}
          </div>
        )}

        {event.registrationUrl && (
          <div className="mb-8">
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
            >
              Register for This Event →
            </a>
          </div>
        )}

        {event.description && (
          <p className="mb-8 text-lg text-muted-foreground">{event.description}</p>
        )}

        {event.content && (
          <RichText className="max-w-none" data={event.content} enableGutter={false} />
        )}
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const event = await queryEventBySlug({ slug: decodeURIComponent(slug) })

  return {
    title: event?.title,
    description: event?.description || `Event details for ${event?.title}`,
  }
}

const queryEventBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'events',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  return result.docs?.[0] || null
})
