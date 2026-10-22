import type { PayloadRequest, SanitizedConfig } from 'payload'
import { describe, expect, it } from 'vitest'

import { restrictEditLocks } from './restrictEditLocks'

const anyone = () => true
const configWith = (slug: string) =>
  ({
    collections: [
      { slug, access: { read: anyone, create: anyone, update: anyone, delete: anyone } },
    ],
  }) as unknown as SanitizedConfig

const asRole = (role: string) => ({ req: { user: { id: 1, role } } as unknown as PayloadRequest })

describe('restrictEditLocks', () => {
  it('lets staff use edit locks and nobody else', () => {
    const access =
      restrictEditLocks(configWith('payload-locked-documents')).collections[0]?.access ?? {}
    for (const operation of ['read', 'create', 'update', 'delete'] as const) {
      const check = access[operation] as (args: unknown) => unknown
      expect(check(asRole('admin'))).toBe(true)
      expect(check(asRole('editor'))).toBe(true)
      expect(check(asRole('resident'))).toBe(false)
      expect(check({ req: { user: null } })).toBe(false)
    }
  })

  it('leaves other collections alone', () => {
    const access = restrictEditLocks(configWith('pages')).collections[0]?.access ?? {}
    expect(access.create).toBe(anyone)
  })
})
