import { beforeEach, describe, expect, it, vi } from 'vitest'

// Payload and the data cache are replaced: this checks the query and how it is cached
const mocks = vi.hoisted(() => ({ findGlobal: vi.fn(), cache: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ findGlobal: mocks.findGlobal }) }))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown, keys: string[], options: unknown) => {
    mocks.cache(keys, options)
    return fn
  },
}))

import { getFooter, getHeader } from './globals'

beforeEach(() => {
  mocks.findGlobal.mockReset().mockResolvedValue({ id: 1, navItems: [] })
  mocks.cache.mockReset()
})

describe.each([
  ['header', getHeader],
  ['footer', getFooter],
])('the %s', (slug, get) => {
  it('loads its links with their pages populated, so page links resolve to addresses', async () => {
    await get()

    expect(mocks.findGlobal).toHaveBeenCalledExactlyOnceWith({
      slug,
      depth: 1,
      overrideAccess: true,
    })
  })

  it('is cached under its own tag, which saving it expires', async () => {
    await get()

    expect(mocks.cache).toHaveBeenCalledWith([slug], { tags: [`global_${slug}`] })
  })
})
