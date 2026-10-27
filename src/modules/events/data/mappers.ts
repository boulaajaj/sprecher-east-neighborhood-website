import 'server-only'

import type { Event } from '@/payload-types'
import { toImageRef } from '@/platform/payload/imageRef'

import type { EventCategoryRef } from '../domain/categories'
import { toMapsHref } from '../domain/maps'
import { isAgendaUrl, isOfficialBody } from '../domain/officialMeetings'
import type { EventDetail, EventSummary } from '../domain/types'

/** The fields `toEventSummary` reads; queries for summaries select exactly these. */
export const SUMMARY_FIELDS = {
  title: true,
  slug: true,
  date: true,
  timeStart: true,
  timeEnd: true,
  cancelled: true,
  officialBody: true,
  categories: true,
  description: true,
  locationName: true,
  heroImage: true,
} as const

type SummaryDoc = Pick<Event, 'id' | keyof typeof SUMMARY_FIELDS>

/** The loaded categories; a category that is only an id (not loaded) is left out. */
function toCategories(values: Event['categories']): EventCategoryRef[] {
  return (values ?? []).flatMap((category) =>
    typeof category === 'object' && category !== null
      ? [{ id: category.id, title: category.title || 'Untitled category' }]
      : [],
  )
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
    cancelled: doc.cancelled === true,
    officialBody: isOfficialBody(doc.officialBody) ? doc.officialBody : null,
    categories: toCategories(doc.categories),
    description: doc.description ?? null,
    locationName: doc.locationName ?? null,
    image: toImageRef(doc.heroImage),
  }
}

/** An event document as its own page shows it. */
export function toEventDetail(doc: Event): EventDetail {
  const locationAddress = doc.locationAddress ?? null
  const summary = toEventSummary(doc)
  return {
    ...summary,
    locationType: doc.locationType ?? null,
    locationAddress,
    mapsHref: toMapsHref(doc.mapsUrl ?? null, locationAddress),
    registrationUrl: doc.registrationUrl ?? null,
    // Only an official meeting has an agenda; a link left behind when the body was cleared, or
    // one stored before the field was checked, is dropped rather than shown
    agendaUrl: summary.officialBody && isAgendaUrl(doc.agendaUrl) ? doc.agendaUrl : null,
    content: doc.content ?? null,
    meta: {
      title: doc.meta?.title ?? null,
      description: doc.meta?.description ?? null,
      image: toImageRef(doc.meta?.image),
    },
  }
}
