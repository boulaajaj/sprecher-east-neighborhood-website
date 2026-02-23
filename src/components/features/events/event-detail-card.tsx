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
    <article className={`bg-white rounded-2xl border border-border shadow-sm overflow-hidden ${past ? 'opacity-75' : ''}`}>
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <CategoryBadge category={event.category} />
          {past && <StatusBadge label="Past Event" />}
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-4">{event.title}</h2>

        <dl className="flex flex-col gap-3 mb-6 text-sm text-muted">
          <div className="flex items-start gap-3">
            <dt className="sr-only">Date</dt>
            <span className="w-4 h-4 mt-0.5 flex-shrink-0">📅</span>
            <dd>
              <span className="font-medium text-foreground">{parts.weekday}, </span>
              {formatDate(event.date)}
            </dd>
          </div>

          {time && (
            <div className="flex items-center gap-3">
              <dt className="sr-only">Time</dt>
              <Clock className="w-4 h-4 text-primary flex-shrink-0" />
              <dd>{time}</dd>
            </div>
          )}

          <div className="flex items-start gap-3">
            <dt className="sr-only">Location</dt>
            <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
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

        <p className="text-foreground leading-relaxed">{event.description}</p>

        <div className="flex flex-wrap gap-3 mt-6">
          {mapsUrl && locType !== 'virtual' && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-surface transition-colors text-muted"
            >
              <MapPin className="w-4 h-4" />
              View Map
            </a>
          )}
          {event.registrationUrl && (
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Register
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
