import React from 'react'

import { CardPreview } from '@/platform/ui/CardPreview'

import type { EventSummary } from '../domain/types'
import { EventCard } from './EventCard'

/** The event's card as the upcoming-events list shows it, for an editor's preview (#363). */
export const EventCardPreview: React.FC<{ event: EventSummary }> = ({ event }) => (
  <CardPreview>
    <EventCard event={event} />
  </CardPreview>
)
