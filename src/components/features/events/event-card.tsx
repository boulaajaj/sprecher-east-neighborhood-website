import { Clock, MapPin } from 'lucide-react'
import type { Event } from '@/lib/types'
import { getEventTime, getEventLocationType, getEventLocationLabel } from '@/lib/data'
import { EventDateBadge } from './event-date-badge'

interface EventCardProps {
  event: Event
  past?: boolean
}

export function EventCard({ event, past = false }: EventCardProps) {
  const time = getEventTime(event)
  const locType = getEventLocationType(event)
  const locLabel = getEventLocationLabel(event)

  return (
    <article
      className={`flex gap-4 rounded-xl border border-border bg-white p-4 transition-shadow hover:shadow-md ${past ? 'opacity-70' : ''}`}
    >
      <EventDateBadge date={event.date} />

      <div className="min-w-0 flex-1">
        <h3 className="mb-1.5 line-clamp-2 text-sm leading-snug font-semibold text-foreground">
          {event.title}
        </h3>

        <div className="mb-2 flex flex-col gap-1 text-xs text-muted">
          {time && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {time}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            {locType === 'virtual' ? 'Virtual / Online' : locLabel}
          </span>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted">{event.description}</p>
      </div>
    </article>
  )
}
