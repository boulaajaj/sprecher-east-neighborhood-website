import type { PayloadRequest, SanitizedConfig } from 'payload'
import { describe, expect, it } from 'vitest'

import { restrictJobStats } from './restrictJobStats'

const anyone = () => true
const configWith = (slug: string) =>
  ({ globals: [{ slug, access: { read: anyone, update: anyone } }] }) as unknown as SanitizedConfig

const asRole = (role: string) => ({ req: { user: { id: 1, role } } as unknown as PayloadRequest })

describe('restrictJobStats', () => {
  it('lets only admins read or change the job stats', () => {
    const access = restrictJobStats(configWith('payload-jobs-stats')).globals[0]?.access ?? {}
    for (const operation of ['read', 'update'] as const) {
      const check = access[operation] as (args: unknown) => unknown
      expect(check(asRole('admin'))).toBe(true)
      expect(check(asRole('editor'))).toBe(false)
      expect(check(asRole('resident'))).toBe(false)
      expect(check({ req: { user: null } })).toBe(false)
    }
  })

  it('leaves other globals alone', () => {
    const access = restrictJobStats(configWith('header')).globals[0]?.access ?? {}
    expect(access.update).toBe(anyone)
  })
})
