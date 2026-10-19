/**
 * Server-side sitemap XML response for the App Router sitemap route handlers.
 *
 * Replaces `getServerSideSitemap` from `next-sitemap` at runtime. `next-sitemap`
 * stays a devDependency for the build-time CLI (`postbuild`), so its file-globbing
 * dependencies (fast-glob/micromatch/braces) are not part of the production runtime.
 * See issue #108.
 */
export type SitemapField = {
  loc: string
  lastmod?: string
}

const XML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

const escapeXml = (value: string): string => value.replace(/[&<>"']/g, (c) => XML_ENTITIES[c] ?? c)

const toW3CDate = (value?: string): string | null => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export function buildSitemapXml(fields: SitemapField[]): string {
  const urls = fields.map(({ loc, lastmod }) => {
    const date = toW3CDate(lastmod)
    return `<url><loc>${escapeXml(loc)}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
  ].join('\n')
}

export function sitemapResponse(fields: SitemapField[]): Response {
  return new Response(buildSitemapXml(fields), {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}
