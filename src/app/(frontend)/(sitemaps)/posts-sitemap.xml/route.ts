import { unstable_cache } from 'next/cache'

import { listPostSlugs } from '@/modules/news/server'
import { getServerSideURL } from '@/utilities/getURL'
import { sitemapResponse } from '@/utilities/sitemapResponse'

const getPostsSitemap = unstable_cache(
  async () => {
    const SITE_URL = getServerSideURL()
    const posts = await listPostSlugs()

    return posts.map(({ slug, updatedAt }) => ({
      loc: `${SITE_URL}/posts/${slug}`,
      lastmod: updatedAt,
    }))
  },
  ['posts-sitemap'],
  {
    tags: ['posts-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPostsSitemap()

  return sitemapResponse(sitemap)
}
