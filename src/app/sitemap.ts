import type { MetadataRoute } from 'next'
import { unstable_cache } from 'next/cache'

import { EVENTS_SITEMAP_CACHE_TAG } from '@/modules/events'
import { listEventSlugs } from '@/modules/events/server'
import { POSTS_SITEMAP_CACHE_TAG } from '@/modules/news'
import { listPostSlugs } from '@/modules/news/server'
import { PAGES_SITEMAP_CACHE_TAG } from '@/modules/site'
import { listPageSlugs } from '@/modules/site/server'
import { getServerSideURL } from '@/platform/lib/getURL'
import { documentHref } from '@/platform/payload/documentHref'

// Rendered on request, so the build doesn't query the database for it. Each list below stays in
// the data cache until a save expires its tag (the pages, posts and events hooks)
export const dynamic = 'force-dynamic'

type Entry = { path: string; lastModified: string }

// The listing pages, which aren't CMS pages, lead the sitemap
const LISTING_PATHS = ['/search', '/posts', '/events', '/faq', '/resources']

const cachedList = (tag: string, list: () => Promise<Entry[]>) =>
  unstable_cache(list, [tag], { tags: [tag] })

const pageEntries = cachedList(PAGES_SITEMAP_CACHE_TAG, async () => {
  const now = new Date().toISOString()
  const pages = await listPageSlugs()

  return [
    ...LISTING_PATHS.map((path) => ({ path, lastModified: now })),
    ...pages
      // A page with no slug has no address of its own
      .filter(({ slug }) => Boolean(slug))
      .map(({ slug, updatedAt }) => ({
        path: documentHref('pages', slug),
        lastModified: updatedAt,
      })),
  ]
})

const postEntries = cachedList(POSTS_SITEMAP_CACHE_TAG, async () =>
  (await listPostSlugs()).map(({ slug, updatedAt }) => ({
    path: documentHref('posts', slug),
    lastModified: updatedAt,
  })),
)

const eventEntries = cachedList(EVENTS_SITEMAP_CACHE_TAG, async () =>
  (await listEventSlugs()).map(({ slug, updatedAt }) => ({
    path: documentHref('events', slug),
    lastModified: updatedAt,
  })),
)

/** `/sitemap.xml`: the listing pages, then every published page, post and event. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getServerSideURL()
  const lists = await Promise.all([pageEntries(), postEntries(), eventEntries()])

  return lists.flat().map(({ path, lastModified }) => ({ url: `${siteUrl}${path}`, lastModified }))
}
