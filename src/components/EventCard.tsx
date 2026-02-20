import Link from 'next/link'
import { Clock, MapPin, ExternalLink } from 'lucide-react'
import type { Event } from '@/lib/types'
import { getDateParts, formatDate } from '@/lib/utils'
import { getEventTime, getEventLocationType, getEventLocationLabel, getSlug } from '@/lib/data'

const CATEGORY_COLORS: Record<string, string> = {
  government: 'bg-blue-50 text-blue-700 border-blue-200',
  community:  'bg-green-50 text-green-700 border-green-200',
  social:     'bg-purple-50 text-purple-700 border-purple-200',
  other:      'bg-surface text-muted border-border',
}

interface Props {
  event: Event
  past?: boolean
  /** 'card' = compact list card (homepage/events), 'full' = full detail card */
  variant?: 'card' | 'full'
}

export default function EventCard({ event, past = false, variant = 'card' }: Props) {
  const parts = getDateParts(event.date)
  const time = getEventTime(event)
  const locType = getEventLocationType(event)
  const locLabel = getEventLocationLabel(event)
  const slug = getSlug(event)
  const categoryLabel = (event.category ?? 'other').charAt(0).toUpperCase() + event.category.slice(1)
  const categoryClass = CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.other

  if (variant === 'full') {
    return (
      <article className={`bg-white rounded-2xl border border-border shadow-sm overflow-hidden ${past ? 'opacity-75' : ''}`}>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${categoryClass}`}>
              {categoryLabel}
            </span>
            {past && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface text-muted border border-border">
                Past Event
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-4">{event.title}</h2>

          <dl className="flex flex-col gap-3 mb-6 text-sm text-muted">
            <div className="flex items-start gap-3">
              <dt className="sr-only">Date</dt>
              <span className="w-4 h-4 mt-0.5 text-primary flex-shrink-0">📅</span>
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

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-6">
            {(event.mapsUrl ?? event.location?.maps_url) && locType !== 'virtual' && (
              <a
                href={event.mapsUrl ?? event.location?.maps_url}
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

  // Compact card variant
  return (
    <article className={`flex gap-4 bg-white rounded-xl border border-border p-4 transition-shadow hover:shadow-md ${past ? 'opacity-70' : ''}`}>
      {/* Date badge */}
      <div className="flex-shrink-0 w-14 flex flex-col items-center justify-center bg-primary/8 rounded-xl py-2 px-1 text-center">
        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{parts.month}</span>
        <span className="text-2xl font-bold text-primary leading-none mt-0.5">{parts.day}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1.5">
          <h3 className="text-sm font-semibold text-foreground leading-snug flex-1 line-clamp-2">
            {event.title}
          </h3>
        </div>

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
