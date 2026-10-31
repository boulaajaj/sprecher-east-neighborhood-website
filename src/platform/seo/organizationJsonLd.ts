import { getServerSideURL } from '@/platform/lib/getURL'

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
