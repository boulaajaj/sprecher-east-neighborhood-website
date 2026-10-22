import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The site module is replaced and the data cache passes straight through: this tests the route
const mocks = vi.hoisted(() => ({ listPageSlugs: vi.fn(), cacheOptions: vi.fn() }))
vi.mock('@/modules/site/server', () => ({ listPageSlugs: mocks.listPageSlugs }))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown, keys: string[], options: unknown) => {
    mocks.cacheOptions(keys, options)
    return fn
  },
}))

import { GET } from './route'

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://sprechereast.example')
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-22T12:00:00Z'))
})
afterEach(() => vi.useRealTimers())

const locs = (xml: string) => [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1])

describe('GET /pages-sitemap.xml', () => {
  it('lists the listing pages, then every published page at its address', async () => {
    mocks.listPageSlugs.mockResolvedValue([
      { slug: 'home', updatedAt: '2026-10-01T00:00:00.000Z' },
      { slug: 'about', updatedAt: '2026-10-02T00:00:00.000Z' },
    ])

    const xml = await (await GET()).text()

    expect(locs(xml)).toEqual([
      'https://sprechereast.example/search',
      'https://sprechereast.example/posts',
      'https://sprechereast.example/events',
      'https://sprechereast.example/faq',
      'https://sprechereast.example/resources',
      'https://sprechereast.example/',
      'https://sprechereast.example/about',
    ])
    expect(xml).toContain('<lastmod>2026-10-02T00:00:00.000Z</lastmod>')
    expect(xml).toContain('<lastmod>2026-10-22T12:00:00.000Z</lastmod>')
  })

  it('caches the sitemap under the tag a page save expires', () => {
    expect(mocks.cacheOptions).toHaveBeenCalledWith(['pages-sitemap'], {
      tags: ['pages-sitemap'],
    })
  })
})
