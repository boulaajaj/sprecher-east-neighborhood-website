import type { Metadata } from 'next'
import Link from 'next/link'
import { getEvents, isUpcoming } from '@/lib/data'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { EventDetailCard } from '@/components/features/events/event-detail-card'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Upcoming and past events for the Sprecher East Neighborhood Association.',
}

export const revalidate = 3600

export default async function EventsPage() {
  const events = await getEvents()
  const upcoming = events.filter((e) => isUpcoming(e.date))
  const past = events.filter((e) => !isUpcoming(e.date))

  return (
    <>
      <PageHeader
        eyebrow="Calendar"
        title="Events"
        description="Community meetings, public hearings, social gatherings, and more. Open to all Sprecher East residents."
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">

        <section id="upcoming" className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-foreground">Upcoming Events</h2>
            {upcoming.length > 0 && (
              <span className="px-2.5 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
                {upcoming.length}
              </span>
            )}
          </div>

          {upcoming.length > 0 ? (
            <div className="flex flex-col gap-4">
              {upcoming.map((event) => (
                <EventDetailCard key={event.id ?? event._id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📅"
              title="No upcoming events right now"
              description="Events are added as they're scheduled. Check back soon."
            />
          )}
        </section>

        <section className="bg-primary/8 border border-primary/20 rounded-2xl p-8 mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <h3 className="font-bold text-foreground mb-1">Have an event to add?</h3>
              <p className="text-sm text-muted">Reach out and we'll get it on the calendar.</p>
            </div>
            <Link
              href="/contact"
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
            >
              Suggest an Event
            </Link>
          </div>
        </section>

        {past.length > 0 && (
          <section id="past">
            <h2 className="text-2xl font-bold text-foreground mb-6">Past Events</h2>
            <div className="flex flex-col gap-4">
              {past.map((event) => (
                <EventDetailCard key={event.id ?? event._id} event={event} past />
              ))}
            </div>
          </section>
        )}

      </div>
    </>
  )
}
