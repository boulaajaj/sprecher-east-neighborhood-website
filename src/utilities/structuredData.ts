import { getServerSideURL } from './getURL'
import type { Post } from '@/payload-types'

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
