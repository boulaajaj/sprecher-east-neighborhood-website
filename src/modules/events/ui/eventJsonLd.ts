import { getServerSideURL, toAbsoluteURL } from '@/utilities/getURL'

import type { EventDetail } from '../domain/types'

const ATTENDANCE_MODE = {
  'in-person': 'https://schema.org/OfflineEventAttendanceMode',
  virtual: 'https://schema.org/OnlineEventAttendanceMode',
  hybrid: 'https://schema.org/MixedEventAttendanceMode',
} as const

/** Structured data for the event page (schema.org `Event`), for search engines' rich results. */
export function eventJsonLd(event: EventDetail): Record<string, unknown> {
  const siteUrl = getServerSideURL()
  const { title, slug, date, description, image, locationName, locationAddress } = event
  const hasPlace = Boolean(locationName || locationAddress)

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: title,
    url: `${siteUrl}/events/${slug}`,
    startDate: date,
    description: description || '',
    eventStatus: 'https://schema.org/EventScheduled',
    organizer: {
      '@type': 'Organization',
      name: 'Sprecher East',
      url: siteUrl,
    },
    ...(image?.url ? { image: toAbsoluteURL(image.url) } : {}),
    ...(hasPlace
      ? {
          location: {
            '@type': 'Place',
            name: locationName || '',
            ...(locationAddress ? { address: locationAddress } : {}),
          },
        }
      : {}),
    eventAttendanceMode: ATTENDANCE_MODE[event.locationType ?? 'in-person'],
  }
}
