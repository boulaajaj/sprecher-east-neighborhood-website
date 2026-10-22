import type { MetadataRoute } from 'next'
import { getServerSideURL } from '@/platform/lib/getURL'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getServerSideURL()

  return {
    rules: [
      {
        userAgent: '*',
        disallow: ['/admin/*'],
      },
    ],
    sitemap: [
      `${siteUrl}/pages-sitemap.xml`,
      `${siteUrl}/posts-sitemap.xml`,
      `${siteUrl}/events-sitemap.xml`,
    ],
  }
}
