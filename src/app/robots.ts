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
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
