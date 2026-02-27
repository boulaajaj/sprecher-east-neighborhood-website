import type { Event } from '@/lib/types'
import { EventCard } from './event-card'
import { EmptyState } from '@/components/ui/empty-state'

interface EventListProps {
  events: Event[]
  past?: boolean
  emptyMessage?: string
  children?: React.ReactNode
}

export function EventList({ events, past = false, emptyMessage, children }: EventListProps) {
  if (events.length === 0) {
    return (
      children ?? (
        <EmptyState
          icon="📅"
          title="No events right now"
          description={emptyMessage ?? 'Check back soon — more events are planned.'}
        />
      )
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((event) => (
        <EventCard key={event.id ?? event._id} event={event} past={past} />
      ))}
    </div>
  )
}
