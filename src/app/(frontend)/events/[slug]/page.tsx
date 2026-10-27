import type { Metadata } from 'next'

import { draftMode } from 'next/headers'
import { ArrowRight } from 'lucide-react'
import React from 'react'

import { Breadcrumbs } from '@/platform/ui/Breadcrumbs'
import { JsonLd } from '@/platform/ui/JsonLd'
import { LivePreviewListener } from '@/platform/ui/LivePreviewListener.client'
import { PayloadRedirects } from '@/modules/site/server'
import { RichText } from '@/platform/richtext/RichText'
import { SidebarCTA } from '@/platform/ui/SidebarCTA'
import {
  EventCardPreview,
  EventHero,
  EventLocation,
  SidebarEvents,
  eventJsonLd,
  findUpcomingEvents,
  getEventBySlug,
  listEventSlugs,
} from '@/modules/events/server'
import { Button } from '@/platform/ui'
import { generateMeta } from '@/platform/seo/generateMeta'
import { DetailLayout } from '@/platform/ui/DetailLayout'
import { Text } from '@/platform/ui/Text'

// A scheduled publish or unpublish runs outside a request, where Next can't refresh the cache, so
// the page also re-renders every 10 minutes (#141, decision 0011)
export const revalidate = 600

export async function generateStaticParams() {
  try {
    const events = await listEventSlugs()
    return events.map(({ slug }) => ({ slug }))
  } catch (error) {
    console.error('[events] generateStaticParams failed; falling back to []', error)
    return []
  }
}

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function EventPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/events/' + decodedSlug
  const event = await getEventBySlug(decodedSlug)

  if (!event) return <PayloadRedirects url={url} />

  const upcomingEvents = await findUpcomingEvents({ excludeId: event.id })
  const hasHeroImage = event.image !== null

  return (
    <article className="pb-24">
      <JsonLd data={eventJsonLd(event)} />
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <EventHero event={event} />

      {draft && <EventCardPreview event={event} />}

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
        <DetailLayout
          aside={
            <>
              <SidebarEvents events={upcomingEvents} title="Upcoming Events" />
              <SidebarCTA
                heading="Stay in the Loop"
                description="Browse all upcoming events and find ways to connect with your neighbors."
                buttonLabel="View All Events"
                buttonHref="/events"
              />
            </>
          }
        >
          <EventLocation event={event} />

          {event.registrationUrl && (
            <div className="mb-8">
              <Button
                href={event.registrationUrl}
                external
                iconEnd={<ArrowRight aria-hidden="true" />}
              >
                Register for This Event
              </Button>
            </div>
          )}

          {event.description && !hasHeroImage && (
            <Text variant="lead" className="mb-8">
              {event.description}
            </Text>
          )}

          {event.content && (
            <RichText className="max-w-[48rem]" data={event.content} enableGutter={false} />
          )}
        </DetailLayout>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const event = await getEventBySlug(decodeURIComponent(slug))

  const meta = await generateMeta({ doc: event && { slug: event.slug, meta: event.meta } })
  if (!event) return meta

  return {
    ...meta,
    openGraph: {
      ...(meta.openGraph ?? {}),
      url: `/events/${event.slug}`,
    },
  }
}
