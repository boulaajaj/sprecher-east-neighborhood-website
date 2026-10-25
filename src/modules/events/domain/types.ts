import type { ImageRef, RichTextValue } from '@/platform/lib'

import type { EventCategoryRef } from './categories'
import type { EventLocationType } from './locationTypes'

/** What an event card or list item shows. */
export type EventSummary = {
  id: number
  slug: string
  title: string
  /** Day-only date, stored as midnight UTC */
  date: string
  /** Free text in site time, for example "6:00 PM" */
  timeStart: string | null
  timeEnd: string | null
  /** The loaded categories, in the order the editor set them */
  categories: EventCategoryRef[]
  description: string | null
  locationName: string | null
  image: ImageRef | null
}

/** Everything the event page shows, including its search-engine fields. */
export type EventDetail = EventSummary & {
  locationType: EventLocationType | null
  locationAddress: string | null
  /** "Open in Google Maps" link (`toMapsHref`) */
  mapsHref: string | null
  registrationUrl: string | null
  content: RichTextValue | null
  meta: {
    title: string | null
    description: string | null
    image: ImageRef | null
  }
}

/** A published event's address and last edit, for static pages and the sitemap. */
export type EventSitemapEntry = {
  slug: string
  updatedAt: string
}
