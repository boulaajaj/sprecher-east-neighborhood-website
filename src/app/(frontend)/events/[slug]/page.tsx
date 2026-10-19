import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { SidebarEvents } from '@/components/SidebarEvents'
import { SidebarCTA } from '@/components/SidebarCTA'
import { startOfToday } from '@/utilities/timezone'
import { eventJsonLd } from '@/utilities/structuredData'
import { generateMeta } from '@/utilities/generateMeta'
import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { EventHero } from '@/heros/EventHero'
import PageClient from './page.client'

export async function generateStaticParams() {
  try {
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
  } catch (error) {
    console.error('[events] generateStaticParams failed; falling back to []', error)
    return []
  }
}

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function EventPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/events/' + decodedSlug
  const event = await queryEventBySlug({ slug: decodedSlug })

  if (!event) return <PayloadRedirects url={url} />

  const upcomingEvents = await queryUpcomingEvents({ excludeId: event.id })

  const hasHeroImage = !!event.heroImage && typeof event.heroImage === 'object'
  // Use the editor's map link if set; otherwise build a plain search link from the
  // address (no API key, no embedded map).
  const mapsHref =
    event.mapsUrl ||
    (event.locationAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.locationAddress)}`
      : null)

  return (
    <article className="pb-24">
      <PageClient hasHeroImage={hasHeroImage} />
      <JsonLd data={eventJsonLd(event)} />
      <PayloadRedirects disableNotFound url={url} />

      <EventHero event={event} />

      <div className={hasHeroImage ? 'pt-8' : 'pt-4'}>
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Community Events', href: '/events' },
              { label: event.title },
            ]}
          />
        </div>
        <div className="container lg:grid lg:grid-cols-[1fr_18rem] lg:gap-8">
          <div>
            {(event.locationName || event.locationAddress) && (
              <div className="mb-8 rounded-lg border border-border bg-surface p-4">
                <h2 className="mb-2 text-base font-semibold">Location</h2>
                {event.locationName && <p>{event.locationName}</p>}
                {event.locationAddress && (
                  <p className="text-sm text-muted-foreground">{event.locationAddress}</p>
                )}
                {mapsHref && (
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
                  >
                    Open in Google Maps
                    <span className="sr-only"> (opens in a new tab)</span> →
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
                  className="inline-flex min-h-11 items-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Register for This Event
                  <span className="sr-only"> (opens in a new tab)</span> →
                </a>
              </div>
            )}

            {event.description && !hasHeroImage && (
              <p className="mb-8 text-lg text-muted-foreground">{event.description}</p>
            )}

            {event.content && (
              <RichText className="max-w-[48rem]" data={event.content} enableGutter={false} />
            )}
          </div>

          <aside className="mt-12 space-y-6 lg:sticky lg:top-24 lg:mt-0 lg:self-start">
            <SidebarEvents events={upcomingEvents} title="Upcoming Events" />
            <SidebarCTA
              heading="Stay in the Loop"
              description="Browse all upcoming events and find ways to connect with your neighbors."
              buttonLabel="View All Events"
              buttonHref="/events"
            />
          </aside>
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const event = await queryEventBySlug({ slug: decodeURIComponent(slug) })

  const meta = await generateMeta({ doc: event })
  if (!event) return meta

  return {
    ...meta,
    openGraph: {
      ...(meta.openGraph ?? {}),
      url: `/events/${event.slug}`,
    },
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

const queryUpcomingEvents = cache(async ({ excludeId }: { excludeId: number }) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'events',
    draft: false,
    limit: 3,
    overrideAccess: false,
    sort: 'date',
    where: {
      and: [{ date: { greater_than_equal: startOfToday() } }, { id: { not_equals: excludeId } }],
    },
    select: {
      title: true,
      slug: true,
      date: true,
      category: true,
    },
  })

  return result.docs
})
