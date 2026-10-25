import React from 'react'

import { CardPreview } from '@/platform/ui/CardPreview'

import type { EventSummary } from '../domain/types'
import { EventCard } from './EventCard'
import { EVENT_GRID_CLASS } from './eventGridClasses'

/** The event's card in the upcoming-events grid's own columns, for an editor's preview (#363). */
export const EventCardPreview: React.FC<{ event: EventSummary }> = ({ event }) => (
  <CardPreview>
    <div className={EVENT_GRID_CLASS}>
      <div className="w-full min-w-0">
        <EventCard event={event} />
      </div>
    </div>
  </CardPreview>
)
