import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

const cache = vi.hoisted(() => ({ expireCacheTag: vi.fn() }))
vi.mock('@/platform/payload/expireCacheTag', () => cache)

import { revalidateRedirects } from './revalidateRedirects'

describe('revalidateRedirects', () => {
  it('expires the cached list of redirects the site follows', () => {
    const req = { payload: { logger: { info: vi.fn() } }, context: {} } as unknown as PayloadRequest
    const doc = { id: 1 }

    const result = revalidateRedirects({
      doc,
      previousDoc: {},
      req,
      collection: {} as never,
      context: {},
      data: {},
      operation: 'update',
    })

    expect(cache.expireCacheTag).toHaveBeenCalledExactlyOnceWith('redirects')
    expect(result).toBe(doc)
  })
})
