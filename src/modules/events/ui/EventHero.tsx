import React from 'react'

import { ImageCredit } from '@/platform/ui/ImageCredit'
import { Media } from '@/platform/ui/Media'
import { Badge, BadgeList } from '@/platform/ui/Badge'
import { DateTime } from '@/platform/ui/DateTime'
import { MetaList, type MetaItem } from '@/platform/ui/MetaList'
import { siteTimeZoneLabel } from '@/platform/lib/timezone'

import { formatEventLocationType } from '../domain/locationTypes'
import type { EventDetail } from '../domain/types'

export const EventHero: React.FC<{
  event: EventDetail
}> = ({ event }) => {
  const { categories, date, image, locationType, timeEnd, timeStart, title } = event

  const locationTypeLabel = locationType ? formatEventLocationType(locationType) : null
  const facts: MetaItem[] = [
    { label: 'Date', value: <DateTime value={date} format="long" /> },
    ...(timeStart
      ? [
          {
            label: 'Time',
            value: `${timeStart}${timeEnd ? ` – ${timeEnd}` : ''} ${siteTimeZoneLabel()}`,
          },
        ]
      : []),
    ...(locationTypeLabel ? [{ label: 'Format', value: locationTypeLabel }] : []),
  ]

  if (image) {
    // Full-bleed hero with image, dark overlay, white text
    return (
      <>
        <div className="relative -mt-[var(--header-height)] flex items-end">
          <div className="relative z-10 container pt-[var(--header-height)] pb-8 text-on-image lg:grid lg:grid-cols-[1fr_48rem_1fr]">
            <div className="col-span-1 col-start-1 md:col-span-2 md:col-start-2">
              {categories.length > 0 && (
                <BadgeList className="mb-4">
                  {categories.map((category) => (
                    <Badge key={category.id} variant="on-image">
                      {category.title}
                    </Badge>
                  ))}
                </BadgeList>
              )}

              <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{title}</h1>

              <MetaList variant="on-image" items={facts} />
            </div>
          </div>

          <div className="min-h-[80vh] select-none">
            <Media fill priority imgClassName="-z-10 object-cover" resource={image} />
            <div className="pointer-events-none absolute bottom-0 left-0 h-1/2 w-full bg-linear-to-t from-scrim to-transparent" />
          </div>
        </div>
        <ImageCredit image={image} className="container mt-2 text-right" />
      </>
    )
  }

  // No hero image — clean header with event metadata
  return (
    <div className="container pt-32 pb-10">
      <div className="max-w-3xl">
        {categories.length > 0 && (
          <BadgeList className="mb-4">
            {categories.map((category) => (
              <Badge key={category.id}>{category.title}</Badge>
            ))}
          </BadgeList>
        )}

        <h1 className="mb-6 text-4xl font-bold md:text-5xl">{title}</h1>

        <MetaList variant="inline" items={facts} />
      </div>
    </div>
  )
}
