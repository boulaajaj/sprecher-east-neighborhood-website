import { unstable_cache } from 'next/cache'

import { PAGES_SITEMAP_CACHE_TAG } from '@/modules/site'
import { listPageSlugs } from '@/modules/site/server'
import { getServerSideURL } from '@/platform/lib/getURL'
import { documentHref } from '@/platform/payload/documentHref'
import { sitemapResponse } from '@/platform/seo/sitemapResponse'

// The listing pages, which aren't CMS pages, lead the pages sitemap
const LISTING_PATHS = ['/search', '/posts', '/events', '/faq', '/resources']

const getPagesSitemap = unstable_cache(
  async () => {
    const SITE_URL = getServerSideURL()
    const pages = await listPageSlugs()
    const dateFallback = new Date().toISOString()

    return [
      ...LISTING_PATHS.map((path) => ({ loc: `${SITE_URL}${path}`, lastmod: dateFallback })),
      ...pages
        // A page with no slug has no address of its own
        .filter(({ slug }) => Boolean(slug))
        .map(({ slug, updatedAt }) => ({
          loc: `${SITE_URL}${documentHref('pages', slug)}`,
          lastmod: updatedAt,
        })),
    ]
  },
  [PAGES_SITEMAP_CACHE_TAG],
  {
    tags: [PAGES_SITEMAP_CACHE_TAG],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return sitemapResponse(sitemap)
}
