import React from 'react'
import { MapPin, Clock, Calendar } from 'lucide-react'

import { Media } from '@/platform/ui/Media'
import { cn } from '@/platform/lib/cn'
import { Badge, BadgeList } from '@/platform/ui/Badge'
import { Card, CardBody, CardFooter, CardMedia, CardTitle } from '@/platform/ui/Card'
import { formatDateShort, formatDateBadge, toDateTimeAttr } from '@/platform/lib/formatDateTime'

import type { EventSummary } from '../domain/types'

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
  /** `h2` where no heading sits between the page's `h1` and the list */
  headingLevel?: 'h2' | 'h3'
}> = ({ event, compact, headingLevel = 'h3' }) => {
  const { slug, title, date, timeStart, timeEnd, categories, description, locationName, image } =
    event

  if (!slug) return null

  const href = `/events/${slug}`

  if (compact) {
    return (
      <Card as="article" padding="sm" interactive className="flex items-center gap-4">
        <DateBadge date={date} className="bg-surface text-center" />
        <div className="min-w-0">
          <time className="text-xs text-muted-foreground" dateTime={toDateTimeAttr(date)}>
            {formatDateShort(date)}
          </time>
          <CardTitle as={headingLevel} href={href} className="truncate text-base">
            {title}
          </CardTitle>
        </div>
      </Card>
    )
  }

  return (
    <Card as="article" padding="none" interactive>
      {/* Image area with date badge overlay */}
      <CardMedia>
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
      </CardMedia>

      <CardBody>
        <CardTitle as={headingLevel} href={href} className="mb-2">
          {title}
        </CardTitle>

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

        {categories.length > 0 && (
          <CardFooter className="pt-0">
            <BadgeList>
              {categories.map((category) => (
                <Badge key={category.id}>{category.title}</Badge>
              ))}
            </BadgeList>
          </CardFooter>
        )}
      </CardBody>
    </Card>
  )
}
