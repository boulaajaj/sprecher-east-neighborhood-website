import Link from 'next/link'
import React from 'react'
import { MapPin, Clock, Calendar } from 'lucide-react'

import type { Event } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatDateShort, formatDateBadge } from '@/utilities/formatDateTime'
import { getCategoryLabel } from '@/utilities/eventCategories'

export type EventCardData = Pick<
  Event,
  | 'slug'
  | 'title'
  | 'date'
  | 'timeStart'
  | 'timeEnd'
  | 'category'
  | 'description'
  | 'locationName'
  | 'heroImage'
>

export const EventCard: React.FC<{
  event: EventCardData
  compact?: boolean
}> = ({ event, compact }) => {
  const { slug, title, date, timeStart, timeEnd, category, description, locationName, heroImage } =
    event

  const { month, day } = formatDateBadge(date)

  if (compact) {
    return (
      <Link
        href={`/events/${slug}`}
        className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-surface text-center">
          <span className="text-xs font-bold uppercase leading-none text-primary">{month}</span>
          <span className="text-lg font-bold leading-tight text-foreground">{day}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{formatDateShort(date)}</p>
          <h3 className="truncate font-semibold text-foreground group-hover:text-primary">
            {title}
          </h3>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/events/${slug}`}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Image area with date badge overlay */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {heroImage && typeof heroImage === 'object' ? (
          <Media
            resource={heroImage}
            fill
            imgClassName="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-surface">
            <Calendar className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}
        {/* Date badge overlay */}
        <div className="absolute top-3 left-3 flex h-16 w-16 flex-col items-center justify-center rounded-xl bg-card/95 shadow-lg backdrop-blur-sm">
          <span className="text-xs font-bold uppercase leading-none text-primary">{month}</span>
          <span className="text-2xl font-bold leading-tight text-foreground">{day}</span>
        </div>
      </div>

      {/* Content area */}
      <div className="p-5 md:p-6">
        <h3 className="mb-2 text-lg leading-snug font-semibold text-foreground group-hover:text-primary">
          {title}
        </h3>

        {/* Time */}
        {timeStart && (
          <div className="mb-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>
              {timeStart}
              {timeEnd ? ` – ${timeEnd}` : ''}
            </span>
          </div>
        )}

        {/* Location */}
        {locationName && (
          <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>{locationName}</span>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}

        {/* Category pill */}
        {category && (
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {getCategoryLabel(category)}
          </span>
        )}
      </div>
    </Link>
  )
}
