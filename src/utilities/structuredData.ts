import { getServerSideURL } from './getURL'
import type { Post, Event as PayloadEvent } from '@/payload-types'

type WithContext<T> = T & { '@context': string }

export function organizationJsonLd(): WithContext<Record<string, unknown>> {
  const siteUrl = getServerSideURL()

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sprecher East',
    url: siteUrl,
    description:
      "Grassroots neighborhood association on Madison's Far East Side — connecting residents of Meadowlands, Door Creek, and Reston Heights.",
  }
}

export function articleJsonLd(post: Post): WithContext<Record<string, unknown>> {
  const siteUrl = getServerSideURL()

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    url: `${siteUrl}/posts/${post.slug}`,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    description: post.meta?.description || '',
    author: {
      '@type': 'Organization',
      name: 'Sprecher East',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Sprecher East',
      url: siteUrl,
    },
  }
}

export function eventJsonLd(event: PayloadEvent): WithContext<Record<string, unknown>> {
  const siteUrl = getServerSideURL()

  const jsonLd: WithContext<Record<string, unknown>> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    url: `${siteUrl}/events/${event.slug}`,
    startDate: event.date,
    description: event.description || '',
  }

  if (event.locationName || event.locationAddress) {
    jsonLd.location = {
      '@type': 'Place',
      name: event.locationName || '',
      ...(event.locationAddress ? { address: event.locationAddress } : {}),
    }
  }

  if (event.locationType === 'virtual') {
    jsonLd.eventAttendanceMode = 'https://schema.org/OnlineEventAttendanceMode'
  } else if (event.locationType === 'hybrid') {
    jsonLd.eventAttendanceMode = 'https://schema.org/MixedEventAttendanceMode'
  } else {
    jsonLd.eventAttendanceMode = 'https://schema.org/OfflineEventAttendanceMode'
  }

  return jsonLd
}
