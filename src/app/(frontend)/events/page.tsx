import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import { formatDateTime } from '@/utilities/formatDateTime'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function EventsPage() {
  const payload = await getPayload({ config: configPromise })

  const events = await payload.find({
    collection: 'events',
    depth: 1,
    limit: 50,
    sort: 'date',
    overrideAccess: false,
  })

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const upcoming = events.docs.filter((e) => new Date(e.date) >= now)
  const past = events.docs.filter((e) => new Date(e.date) < now).reverse()

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose max-w-none">
          <h1>Community Events</h1>
          <p className="text-muted-foreground">
            Join your neighbors at upcoming events in the Sprecher East neighborhood.
          </p>
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="container mb-16">
          <h2 className="mb-8 text-2xl font-semibold">Upcoming Events</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-2 text-sm font-medium text-primary">
                  {formatDateTime(event.date)}
                </div>
                {event.timeStart && (
                  <div className="mb-3 text-sm text-muted-foreground">
                    {event.timeStart}
                    {event.timeEnd ? ` – ${event.timeEnd}` : ''}
                  </div>
                )}
                <h3 className="mb-2 text-lg font-semibold group-hover:text-primary">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
                )}
                {event.locationName && (
                  <div className="mt-3 text-sm text-muted-foreground">📍 {event.locationName}</div>
                )}
                {event.category && (
                  <span className="mt-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {event.category}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {upcoming.length === 0 && (
        <div className="container mb-16 text-center">
          <p className="text-muted-foreground">
            No upcoming events right now. Check back soon or follow us for updates!
          </p>
        </div>
      )}

      {past.length > 0 && (
        <div className="container">
          <h2 className="mb-8 text-2xl font-semibold text-muted-foreground">Past Events</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group rounded-lg border border-border bg-card/50 p-4 opacity-75 transition-opacity hover:opacity-100"
              >
                <div className="mb-1 text-sm text-muted-foreground">
                  {formatDateTime(event.date)}
                </div>
                <h3 className="text-base font-medium group-hover:text-primary">{event.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  const title = 'Community Events'
  const description =
    'Upcoming events in the Sprecher East neighborhood — meetings, socials, volunteer opportunities, and more.'

  return {
    title,
    description,
    openGraph: mergeOpenGraph({ title, description }),
  }
}
