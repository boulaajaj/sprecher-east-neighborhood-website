import { unstable_cache } from 'next/cache'

import { listEventSlugs } from '@/modules/events/server'
import { getServerSideURL } from '@/platform/lib/getURL'
import { sitemapResponse } from '@/platform/seo/sitemapResponse'

const getEventsSitemap = unstable_cache(
  async () => {
    const SITE_URL = getServerSideURL()
    const events = await listEventSlugs()

    return events.map(({ slug, updatedAt }) => ({
      loc: `${SITE_URL}/events/${slug}`,
      lastmod: updatedAt,
    }))
  },
  ['events-sitemap'],
  {
    tags: ['events-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getEventsSitemap()

  return sitemapResponse(sitemap)
}
