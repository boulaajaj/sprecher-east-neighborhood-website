import { describe, expect, it, vi } from 'vitest'

import { isSeedEnabled } from './isSeedEnabled'

describe('isSeedEnabled', () => {
  it('is off in production builds', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(isSeedEnabled()).toBe(false)
  })

  it('is on in local development and tests', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(isSeedEnabled()).toBe(true)
    vi.stubEnv('NODE_ENV', 'test')
    expect(isSeedEnabled()).toBe(true)
  })
})
