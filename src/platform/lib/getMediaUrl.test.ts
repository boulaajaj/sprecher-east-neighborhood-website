import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getMediaUrl } from './getMediaUrl'

describe('getMediaUrl', () => {
  // A configured site URL must not turn an upload into a remote URL (Next 16 blocks those on
  // private IPs, which breaks images on localhost)
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://sprechereast.example')
  })

  it('keeps an upload path relative, so next/image treats it as local', () => {
    expect(getMediaUrl('/api/media/file/park.webp')).toBe('/api/media/file/park.webp')
  })

  it('adds the cache tag as an encoded query string', () => {
    expect(getMediaUrl('/api/media/file/park.webp', '2026-10-21T12:00:00.000Z')).toBe(
      '/api/media/file/park.webp?2026-10-21T12%3A00%3A00.000Z',
    )
  })

  it("makes the site's own upload URLs relative (Payload prefixes them with serverURL)", () => {
    expect(getMediaUrl('https://sprechereast.example/api/media/file/park.webp', 'v1')).toBe(
      '/api/media/file/park.webp?v1',
    )
  })

  it('leaves an absolute URL on another host as it is', () => {
    expect(getMediaUrl('https://cdn.example.com/park.webp')).toBe(
      'https://cdn.example.com/park.webp',
    )
  })

  it('returns an empty string when there is no URL', () => {
    expect(getMediaUrl(null)).toBe('')
    expect(getMediaUrl(undefined, 'tag')).toBe('')
  })
})
