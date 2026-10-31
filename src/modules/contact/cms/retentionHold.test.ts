import type { FieldAccess } from 'payload'
import { describe, expect, it } from 'vitest'

import { retentionHoldFields, validateHoldReason } from './retentionHold'

const asUser = (role: string | null) =>
  ({
    req: { user: role ? { id: 1, role, collection: 'users' } : null },
  }) as Parameters<FieldAccess>[0]

describe('the retention hold fields (#274)', () => {
  it.each(['retentionHold', 'retentionHoldReason'])(
    '%s is admin-only, and never set when a message is sent',
    async (name) => {
      const field = retentionHoldFields.find((f) => 'name' in f && f.name === name)
      const access = field && 'access' in field ? field.access : undefined
      for (const audience of [null, 'resident', 'editor', 'admin']) {
        expect(await access?.create?.(asUser(audience))).toBe(false)
      }
      for (const operation of ['read', 'update'] as const) {
        expect(await access?.[operation]?.(asUser(null))).toBe(false)
        expect(await access?.[operation]?.(asUser('resident'))).toBe(false)
        expect(await access?.[operation]?.(asUser('admin'))).toBe(true)
      }
    },
  )

  it('needs a reason while the hold is on', () => {
    const on = { siblingData: { retentionHold: true } }
    expect(validateHoldReason('', on)).toBe('Say why this message is kept longer.')
    expect(validateHoldReason('   ', on)).toBe('Say why this message is kept longer.')
    expect(validateHoldReason('Open noise complaint with the city', on)).toBe(true)
    expect(validateHoldReason('', { siblingData: { retentionHold: false } })).toBe(true)
  })
})
