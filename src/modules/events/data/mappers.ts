import 'server-only'

import type { Event } from '@/payload-types'
import type { ImageRef } from '@/platform/lib'

import { toMapsHref } from '../domain/maps'
import type { EventDetail, EventSummary } from '../domain/types'

/** The fields `toEventSummary` reads; queries for summaries select exactly these. */
export const SUMMARY_FIELDS = {
  title: true,
  slug: true,
  date: true,
  timeStart: true,
  timeEnd: true,
  category: true,
  description: true,
  locationName: true,
  heroImage: true,
} as const

type SummaryDoc = Pick<Event, 'id' | keyof typeof SUMMARY_FIELDS>

/** An upload field holds the image once loaded (`depth` ≥ 1), and only its id otherwise. */
function toImage(value: Event['heroImage']): ImageRef | null {
  return typeof value === 'object' ? value : null
}

/** An event document as a card or list item shows it. */
export function toEventSummary(doc: SummaryDoc): EventSummary {
  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    date: doc.date,
    timeStart: doc.timeStart ?? null,
    timeEnd: doc.timeEnd ?? null,
    category: doc.category ?? null,
    description: doc.description ?? null,
    locationName: doc.locationName ?? null,
    image: toImage(doc.heroImage),
  }
}

/** An event document as its own page shows it. */
export function toEventDetail(doc: Event): EventDetail {
  const locationAddress = doc.locationAddress ?? null
  return {
    ...toEventSummary(doc),
    locationType: doc.locationType ?? null,
    locationAddress,
    mapsHref: toMapsHref(doc.mapsUrl ?? null, locationAddress),
    registrationUrl: doc.registrationUrl ?? null,
    content: doc.content ?? null,
    meta: {
      title: doc.meta?.title ?? null,
      description: doc.meta?.description ?? null,
      image: toImage(doc.meta?.image),
    },
  }
}
