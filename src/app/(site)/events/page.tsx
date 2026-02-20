import type { Metadata } from 'next'
import Link from 'next/link'
import { getEvents, isUpcoming } from '@/lib/data'
import EventCard from '@/components/EventCard'

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
      {/* Page header */}
      <header className="bg-surface border-b border-border py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Calendar</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Events</h1>
          <p className="text-muted text-lg max-w-2xl leading-relaxed">
            Community meetings, public hearings, social gatherings, and more.
            Open to all Sprecher East residents.
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">

        {/* Upcoming */}
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
                <EventCard key={event.id ?? event._id} event={event} variant="full" />
              ))}
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-border p-10 text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No upcoming events right now</h3>
              <p className="text-muted text-sm max-w-sm mx-auto">
                Events are added as they're scheduled. Check back soon, or{' '}
                <Link href="/contact" className="text-primary underline hover:text-primary-dark">
                  contact us
                </Link>{' '}
                if you'd like to suggest one.
              </p>
            </div>
          )}
        </section>

        {/* Suggest an event */}
        <section className="bg-primary/8 border border-primary/20 rounded-2xl p-8 mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <h3 className="font-bold text-foreground mb-1">Have an event to add?</h3>
              <p className="text-sm text-muted">
                Reach out and we'll get it on the calendar.
              </p>
            </div>
            <Link
              href="/contact"
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
            >
              Suggest an Event
            </Link>
          </div>
        </section>

        {/* Past events */}
        {past.length > 0 && (
          <section id="past">
            <h2 className="text-2xl font-bold text-foreground mb-6">Past Events</h2>
            <div className="flex flex-col gap-4">
              {past.map((event) => (
                <EventCard key={event.id ?? event._id} event={event} variant="full" past />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
