import React from 'react'

import { siteTimeZoneLabel } from '@/platform/lib/timezone'
import { Badge, BadgeList } from '@/platform/ui/Badge'
import { DateTime } from '@/platform/ui/DateTime'
import type { LabelledMetaItem } from '@/platform/ui/MetaList'
import type { PageHeaderProps } from '@/platform/ui/PageHeader'

import { formatEventLocationType } from '../domain/locationTypes'
import type { EventDetail } from '../domain/types'
import { CancelledBadge } from './CancelledBadge'

/**
 * The top of an event's page as `PageHeader` props (#461): its categories, title, date, time and
 * format, on its photo (`image`), or plain (`default`) when it has none. A cancelled event's
 * "Cancelled" label leads the eyebrow (#122).
 */
export function eventHeaderProps(event: EventDetail): PageHeaderProps {
  const { cancelled, categories, date, image, locationType, timeEnd, timeStart, title } = event
  const facts: LabelledMetaItem[] = [
    { label: 'Date', value: <DateTime value={date} format="long" /> },
    ...(timeStart
      ? [
          {
            label: 'Time',
            value: `${timeStart}${timeEnd ? ` – ${timeEnd}` : ''} ${siteTimeZoneLabel()}`,
          },
        ]
      : []),
    ...(locationType ? [{ label: 'Format', value: formatEventLocationType(locationType) }] : []),
  ]
  const badge = image ? 'on-image' : 'category'
  const eyebrow =
    cancelled || categories.length > 0 ? (
      <BadgeList>
        {cancelled && <CancelledBadge variant={image ? 'on-image' : 'status'} />}
        {categories.map((category) => (
          <Badge key={category.id} variant={badge}>
            {category.title}
          </Badge>
        ))}
      </BadgeList>
    ) : undefined

  return image ? { variant: 'image', image, eyebrow, title, facts } : { eyebrow, title, facts }
}
