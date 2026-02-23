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
    <article className={`flex gap-4 bg-white rounded-xl border border-border p-4 transition-shadow hover:shadow-md ${past ? 'opacity-70' : ''}`}>
      <EventDateBadge date={event.date} />

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 mb-1.5">
          {event.title}
        </h3>

        <div className="flex flex-col gap-1 text-xs text-muted mb-2">
          {time && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {time}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            {locType === 'virtual' ? 'Virtual / Online' : locLabel}
          </span>
        </div>

        <p className="text-xs text-muted line-clamp-2 leading-relaxed">{event.description}</p>
      </div>
    </article>
  )
}
