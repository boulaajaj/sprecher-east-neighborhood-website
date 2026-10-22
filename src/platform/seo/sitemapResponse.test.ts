import { describe, expect, it } from 'vitest'

import { buildSitemapXml, sitemapResponse } from './sitemapResponse'

describe('buildSitemapXml', () => {
  it('lists each address with its last edit as a W3C date', () => {
    const xml = buildSitemapXml([
      { loc: 'https://sprechereast.example/events', lastmod: '2026-10-20T15:04:05Z' },
    ])

    expect(xml).toBe(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '<url><loc>https://sprechereast.example/events</loc><lastmod>2026-10-20T15:04:05.000Z</lastmod></url>',
        '</urlset>',
      ].join('\n'),
    )
  })

  it('escapes the five XML special characters in an address', () => {
    const xml = buildSitemapXml([{ loc: `https://a.example/?q=1&r="2"<'3'>` }])

    expect(xml).toContain(
      '<loc>https://a.example/?q=1&amp;r=&quot;2&quot;&lt;&apos;3&apos;&gt;</loc>',
    )
  })

  it('leaves out a missing or unreadable last edit', () => {
    const xml = buildSitemapXml([
      { loc: 'https://a.example/one' },
      { loc: 'https://a.example/two', lastmod: 'not a date' },
    ])

    expect(xml).not.toContain('<lastmod>')
  })
})

describe('sitemapResponse', () => {
  it('answers 200 with the XML as text/xml', async () => {
    const response = sitemapResponse([{ loc: 'https://a.example/' }])

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/xml')
    expect(await response.text()).toBe(buildSitemapXml([{ loc: 'https://a.example/' }]))
  })
})
