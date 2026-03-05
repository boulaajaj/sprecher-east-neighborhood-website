import React from 'react'

import type { Event } from '@/payload-types'

import { Media } from '@/components/Media'
import { categoryPillClassName } from '@/utilities/ui'
import { formatDateTime } from '@/utilities/formatDateTime'
import { getCategoryLabel } from '@/utilities/eventCategories'

export const EventHero: React.FC<{
  event: Event
}> = ({ event }) => {
  const { category, date, heroImage, locationType, timeEnd, timeStart, title } = event

  const locationTypeLabel =
    locationType === 'in-person'
      ? 'In Person'
      : locationType === 'virtual'
        ? 'Virtual'
        : locationType === 'hybrid'
          ? 'Hybrid'
          : null

  if (heroImage && typeof heroImage === 'object') {
    // Full-bleed hero with image, dark overlay, white text
    return (
      <div className="relative -mt-[10.4rem] flex items-end">
        <div className="relative z-10 container pb-8 text-white lg:grid lg:grid-cols-[1fr_48rem_1fr]">
          <div className="col-span-1 col-start-1 md:col-span-2 md:col-start-2">
            {category && (
              <div className="mb-4 text-sm tracking-widest uppercase opacity-90">
                {getCategoryLabel(category)}
              </div>
            )}

            <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{title}</h1>

            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-white/70">Date</span>
                <time dateTime={date}>{formatDateTime(date)}</time>
              </div>

              {timeStart && (
                <div className="flex flex-col gap-1">
                  <span className="text-white/70">Time</span>
                  <span>
                    {timeStart}
                    {timeEnd ? ` – ${timeEnd}` : ''}
                  </span>
                </div>
              )}

              {locationTypeLabel && (
                <div className="flex flex-col gap-1">
                  <span className="text-white/70">Format</span>
                  <span>{locationTypeLabel}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="min-h-[80vh] select-none">
          <Media fill priority imgClassName="-z-10 object-cover" resource={heroImage} />
          <div className="pointer-events-none absolute bottom-0 left-0 h-1/2 w-full bg-linear-to-t from-black to-transparent" />
        </div>
      </div>
    )
  }

  // No hero image — clean header with event metadata
  return (
    <div className="container pt-32 pb-10">
      <div className="max-w-3xl">
        {category && (
          <span className={`mb-4 ${categoryPillClassName}`}>{getCategoryLabel(category)}</span>
        )}

        <h1 className="mb-6 text-4xl font-bold md:text-5xl">{title}</h1>

        <div className="flex flex-wrap gap-6 text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Date: </span>
            <time dateTime={date}>{formatDateTime(date)}</time>
          </div>

          {timeStart && (
            <div>
              <span className="font-medium text-foreground">Time: </span>
              {timeStart}
              {timeEnd ? ` – ${timeEnd}` : ''}
            </div>
          )}

          {locationTypeLabel && (
            <div>
              <span className="font-medium text-foreground">Format: </span>
              {locationTypeLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
