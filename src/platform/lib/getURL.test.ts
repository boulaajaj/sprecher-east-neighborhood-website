import { describe, expect, it, vi } from 'vitest'

import { getServerSideURL, toAbsoluteURL } from './getURL'

describe('getServerSideURL', () => {
  it('uses NEXT_PUBLIC_SERVER_URL when set', () => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://sprechereast.example')
    expect(getServerSideURL()).toBe('https://sprechereast.example')
  })

  it('falls back to localhost for local development', () => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', '')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '')
    expect(getServerSideURL()).toBe('http://localhost:3000')
  })
})

describe('toAbsoluteURL', () => {
  it('prefixes a site path with the server URL', () => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://sprechereast.example')
    expect(toAbsoluteURL('/media/photo.webp')).toBe('https://sprechereast.example/media/photo.webp')
  })

  it('leaves an absolute URL alone instead of doubling the host', () => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://sprechereast.example')
    expect(toAbsoluteURL('https://sprechereast.example/api/media/file/a.webp')).toBe(
      'https://sprechereast.example/api/media/file/a.webp',
    )
  })
})
