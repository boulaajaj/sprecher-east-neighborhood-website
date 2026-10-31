import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { authenticatedOrPublished } from './authenticatedOrPublished'

const readAs = (user: { id: number; role?: string } | null) =>
  authenticatedOrPublished({ req: { user } as PayloadRequest })

const PUBLISHED_ONLY = { _status: { equals: 'published' } }

describe('authenticatedOrPublished', () => {
  it('shows staff every document, drafts included', () => {
    expect(readAs({ id: 1, role: 'admin' })).toBe(true)
    expect(readAs({ id: 2, role: 'editor' })).toBe(true)
  })

  it('shows residents, accounts without a role and visitors only published documents', () => {
    expect(readAs({ id: 3, role: 'resident' })).toEqual(PUBLISHED_ONLY)
    expect(readAs({ id: 4 })).toEqual(PUBLISHED_ONLY)
    expect(readAs(null)).toEqual(PUBLISHED_ONLY)
  })
})
