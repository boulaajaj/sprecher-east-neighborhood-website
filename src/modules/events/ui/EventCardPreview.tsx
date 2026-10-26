import React from 'react'

import { CardPreview } from '@/platform/ui/CardPreview'

import type { EventSummary } from '../domain/types'
import { EventCard } from './EventCard'
import { CardGrid, CardGridItem } from '@/platform/ui/CardGrid'

/** The event's card in the upcoming-events grid's own columns, for an editor's preview (#363). */
export const EventCardPreview: React.FC<{ event: EventSummary }> = ({ event }) => (
  <CardPreview>
    <CardGrid as="div">
      <CardGridItem as="div">
        <EventCard event={event} />
      </CardGridItem>
    </CardGrid>
  </CardPreview>
)
