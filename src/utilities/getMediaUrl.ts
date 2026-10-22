import { getServerSideURL } from './getURL'

/**
 * The URL to render an upload with, plus its cache tag. Uploads on this site come back relative
 * (`/api/media/file/park.webp`): Payload prefixes them with its `serverURL`, and this removes it.
 * next/image then reads them as local files: since Next 16 it refuses remote URLs that resolve to
 * a private IP, such as localhost. URLs on other hosts pass through unchanged.
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  const site = new URL(getServerSideURL())
  const parsed = new URL(url, site)
  const path = parsed.origin === site.origin ? `${parsed.pathname}${parsed.search}` : url

  return cacheTag ? `${path}?${encodeURIComponent(cacheTag)}` : path
}
