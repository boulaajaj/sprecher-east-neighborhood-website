import { Clock, MapPin, ExternalLink } from 'lucide-react'
import type { Event } from '@/lib/types'
import { getDateParts, formatDate } from '@/lib/utils'
import { getEventTime, getEventLocationType, getEventLocationLabel } from '@/lib/data'
import { CategoryBadge, StatusBadge } from '@/components/ui/badge'

interface EventDetailCardProps {
  event: Event
  past?: boolean
}

export function EventDetailCard({ event, past = false }: EventDetailCardProps) {
  const parts = getDateParts(event.date)
  const time = getEventTime(event)
  const locType = getEventLocationType(event)
  const locLabel = getEventLocationLabel(event)
  const mapsUrl = event.mapsUrl ?? event.location?.maps_url

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-border bg-white shadow-sm ${past ? 'opacity-75' : ''}`}
    >
      <div className="p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <CategoryBadge category={event.category} />
          {past && <StatusBadge label="Past Event" />}
        </div>

        <h2 className="mb-4 text-2xl font-bold text-foreground">{event.title}</h2>

        <dl className="mb-6 flex flex-col gap-3 text-sm text-muted">
          <div className="flex items-start gap-3">
            <dt className="sr-only">Date</dt>
            <span className="mt-0.5 h-4 w-4 flex-shrink-0">📅</span>
            <dd>
              <span className="font-medium text-foreground">{parts.weekday}, </span>
              {formatDate(event.date)}
            </dd>
          </div>

          {time && (
            <div className="flex items-center gap-3">
              <dt className="sr-only">Time</dt>
              <Clock className="h-4 w-4 flex-shrink-0 text-primary" />
              <dd>{time}</dd>
            </div>
          )}

          <div className="flex items-start gap-3">
            <dt className="sr-only">Location</dt>
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
            <dd>
              {locType === 'virtual' ? (
                <span>Virtual / Online</span>
              ) : (
                <>
                  <span className="font-medium text-foreground">{locLabel}</span>
                  {(event.locationAddress ?? event.location?.address) && (
                    <span className="block text-muted">
                      {event.locationAddress ?? event.location?.address},{' '}
                      {event.locationCity ?? event.location?.city}
                    </span>
                  )}
                </>
              )}
            </dd>
          </div>
        </dl>

        <p className="leading-relaxed text-foreground">{event.description}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {mapsUrl && locType !== 'virtual' && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface"
            >
              <MapPin className="h-4 w-4" />
              View Map
            </a>
          )}
          {event.registrationUrl && (
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Register
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
