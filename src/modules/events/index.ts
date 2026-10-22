// Client-safe entry: types, pure rules and components that load no data.
// Queries and the "Load more" feed are in server.ts; the collection is in cms.ts.
export type { EventCategory } from './domain/categories'
export type { EventLocationType } from './domain/locationTypes'
export type { EventDetail, EventSlug, EventSummary } from './domain/types'
export { isEventScope, type EventScope } from './domain/upcoming'

export { EventHero } from './ui/EventHero'
export { eventJsonLd } from './ui/eventJsonLd'
export { EventLocation } from './ui/EventLocation'
export { SidebarEvents } from './ui/SidebarEvents'
