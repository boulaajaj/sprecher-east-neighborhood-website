import Link from 'next/link'
import React from 'react'

import type { Event } from '@/payload-types'
import { getCategoryLabel } from '@/utilities/eventCategories'

export type SidebarEventData = Pick<Event, 'slug' | 'title' | 'date' | 'category'>

export const SidebarEvents: React.FC<{
  events: SidebarEventData[]
  title?: string
}> = ({ events, title = 'Upcoming Events' }) => {
  if (!events || events.length === 0) return null

  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
        {title}
      </h3>
      <ul className="space-y-4">
        {events.map((event) => {
          const eventDate = new Date(event.date)
          // Event dates are day-only (midnight UTC) — use UTC to avoid off-by-one
          const month = eventDate.toLocaleDateString('en-US', {
            month: 'short',
            timeZone: 'UTC',
          })
          const day = Number(
            eventDate.toLocaleDateString('en-US', {
              day: 'numeric',
              timeZone: 'UTC',
            }),
          )

          return (
            <li key={event.slug}>
              <Link href={`/events/${event.slug}`} className="group flex gap-3">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
                  <span className="text-xs leading-none font-medium uppercase">{month}</span>
                  <span className="text-lg leading-tight font-bold">{day}</span>
                </div>
                <div className="min-w-0">
                  <span className="block text-sm leading-snug font-medium text-foreground group-hover:text-primary">
                    {event.title}
                  </span>
                  {event.category && (
                    <span className="text-xs text-muted-foreground">
                      {getCategoryLabel(event.category)}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
