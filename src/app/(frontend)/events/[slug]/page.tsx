import type { Metadata } from 'next'

import { ArrowRight } from 'lucide-react'
import React from 'react'

import { Breadcrumbs } from '@/platform/ui/Breadcrumbs'
import { JsonLd } from '@/platform/ui/JsonLd'
import { PayloadRedirects } from '@/modules/site/server'
import { RichText } from '@/platform/richtext/RichText'
import { SidebarCTA } from '@/platform/ui/SidebarCTA'
import {
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
import PageClient from './page.client'

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
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/events/' + decodedSlug
  const event = await getEventBySlug(decodedSlug)

  if (!event) return <PayloadRedirects url={url} />

  const upcomingEvents = await findUpcomingEvents({ excludeId: event.id })
  const hasHeroImage = event.image !== null

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
