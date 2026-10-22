import { ArrowRight } from 'lucide-react'
import React from 'react'

import { Link } from '@/platform/ui'

import type { EventDetail } from '../domain/types'

/** The event page's place panel: name, address and a map link. Nothing when there is no place. */
export const EventLocation: React.FC<{
  event: Pick<EventDetail, 'locationName' | 'locationAddress' | 'mapsHref'>
}> = ({ event: { locationName, locationAddress, mapsHref } }) => {
  if (!locationName && !locationAddress) return null

  return (
    <div className="mb-8 rounded-lg border border-border bg-surface p-4">
      <h2 className="mb-2 text-base font-semibold">Location</h2>
      {locationName && <p>{locationName}</p>}
      {locationAddress && <p className="text-sm text-muted-foreground">{locationAddress}</p>}
      {mapsHref && (
        <Link
          href={mapsHref}
          variant="action"
          external
          icon={<ArrowRight aria-hidden="true" />}
          iconPosition="end"
          className="mt-2"
        >
          Open in Google Maps
        </Link>
      )}
    </div>
  )
}
