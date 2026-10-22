import Link from 'next/link'
import React from 'react'
import { MapPin, Clock, Calendar } from 'lucide-react'

import { Media } from '@/platform/ui/Media'
import { cn } from '@/platform/lib/cn'
import { categoryPillClassName } from '@/platform/ui/categoryPill'
import { formatDateShort, formatDateBadge, toDateTimeAttr } from '@/platform/lib/formatDateTime'

import { formatEventCategory } from '../domain/categories'
import type { EventSummary } from '../domain/types'

/**
 * Stretches the title link over the whole card so the card stays clickable, while the
 * link's accessible name is just the event title (not every line of the card).
 */
const stretchedLinkClassName =
  'after:absolute after:inset-0 after:rounded-[inherit] after:content-[""] focus-visible:outline-none'

const DateBadge: React.FC<{
  date: string
  size?: 'sm' | 'lg'
  className?: string
}> = ({ date, size = 'sm', className = '' }) => {
  const { month, day } = formatDateBadge(date)
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex shrink-0 flex-col items-center justify-center',
        size === 'lg' ? 'h-16 w-16 rounded-xl' : 'h-14 w-14 rounded-lg',
        className,
      )}
    >
      <span className="text-xs leading-none font-bold text-primary uppercase">{month}</span>
      <span
        className={cn(
          'leading-tight font-bold text-foreground',
          size === 'lg' ? 'text-2xl' : 'text-lg',
        )}
      >
        {day}
      </span>
    </div>
  )
}

export const EventCard: React.FC<{
  event: EventSummary
  compact?: boolean
}> = ({ event, compact }) => {
  const { slug, title, date, timeStart, timeEnd, category, description, locationName, image } =
    event

  if (!slug) return null

  const href = `/events/${slug}`

  if (compact) {
    return (
      <article className="group relative flex min-w-0 items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring motion-safe:hover:-translate-y-0.5">
        <DateBadge date={date} className="bg-surface text-center" />
        <div className="min-w-0">
          <time className="text-xs text-muted-foreground" dateTime={toDateTimeAttr(date)}>
            {formatDateShort(date)}
          </time>
          <h3 className="truncate font-semibold text-foreground group-hover:text-primary">
            <Link href={href} className={stretchedLinkClassName}>
              {title}
            </Link>
          </h3>
        </div>
      </article>
    )
  }

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all duration-200 hover:shadow-xl has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring motion-safe:hover:-translate-y-1">
      {/* Image area with date badge overlay */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {image ? (
          <Media
            resource={image}
            fill
            imgClassName="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-surface">
            <Calendar aria-hidden="true" className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}
        <DateBadge
          date={date}
          size="lg"
          className="absolute top-3 left-3 bg-card/95 shadow-lg backdrop-blur-sm"
        />
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <h3 className="mb-2 text-lg leading-snug font-semibold text-foreground group-hover:text-primary">
          <Link href={href} className={stretchedLinkClassName}>
            {title}
          </Link>
        </h3>

        {/* Date (the badge above is decorative) and time — never invent a time */}
        <p className="mb-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          <span>
            <time dateTime={toDateTimeAttr(date)}>{formatDateShort(date)}</time>
            {timeStart ? ` · ${timeStart}${timeEnd ? ` – ${timeEnd}` : ''}` : ''}
          </span>
        </p>

        {locationName && (
          <p className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            <span>{locationName}</span>
          </p>
        )}

        {description && (
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}

        {category && (
          <span className={cn(categoryPillClassName, 'mt-auto self-start')}>
            {formatEventCategory(category)}
          </span>
        )}
      </div>
    </article>
  )
}
