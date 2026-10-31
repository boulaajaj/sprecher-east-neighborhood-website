import { APIError } from 'payload'
import { describe, expect, it } from 'vitest'

import { CONFIRM_ON_ACCOUNT_PAGE, CURRENT_PASSWORD_CONFIRMED } from '../domain/passwordConfirmation'
import { requireCurrentPassword } from './requireCurrentPassword'

type HookArgs = Parameters<typeof requireCurrentPassword>[0]

const resident = { id: 7, collection: 'users', role: 'resident' }
const admin = { id: 1, collection: 'users', role: 'admin' }

/** Runs the hook as Payload does, with only the arguments it reads. */
const run = ({
  user = resident as unknown,
  id = 7,
  data = { password: 'new-secret' } as Record<string, unknown>,
  operation = 'update',
  context = {},
}: {
  user?: unknown
  id?: number
  data?: Record<string, unknown>
  operation?: string
  context?: Record<string, unknown>
} = {}) =>
  requireCurrentPassword({
    collection: { slug: 'users' },
    data,
    operation,
    originalDoc: operation === 'update' ? { id } : undefined,
    context,
    req: { user, context },
  } as unknown as HookArgs)

describe('requireCurrentPassword', () => {
  it('refuses a new password on your own account sent any other way (REST, GraphQL, /admin)', () => {
    expect(() => run()).toThrow(APIError)
    expect(() => run()).toThrow(CONFIRM_ON_ACCOUNT_PAGE)
    try {
      run()
    } catch (error) {
      expect((error as APIError).status).toBe(403)
    }
    // Same for an admin on their own account, and for an id given as a string
    expect(() => run({ user: admin, id: 1 })).toThrow(CONFIRM_ON_ACCOUNT_PAGE)
    expect(() => run({ user: { ...resident, id: '7' } })).toThrow(CONFIRM_ON_ACCOUNT_PAGE)
  })

  it('refuses it even when the context holds something else under the key', () => {
    expect(() => run({ context: { [CURRENT_PASSWORD_CONFIRMED]: 'yes' } })).toThrow(
      CONFIRM_ON_ACCOUNT_PAGE,
    )
  })

  it('lets a change through once the current password was confirmed on the server', () => {
    const data = { password: 'new-secret' }
    expect(run({ data, context: { [CURRENT_PASSWORD_CONFIRMED]: true } })).toBe(data)
  })

  it('lets an admin set another account’s password', () => {
    const data = { password: 'new-secret' }
    expect(run({ user: admin, id: 7, data })).toBe(data)
  })

  it('lets new accounts get a password, and server code without a user set one', () => {
    const data = { password: 'new-secret' }
    expect(run({ operation: 'create', data })).toBe(data)
    expect(run({ user: null, data })).toBe(data)
  })

  it('leaves your other changes alone', () => {
    expect(run({ data: { name: 'Ada' } })).toEqual({ name: 'Ada' })
    expect(run({ data: { name: 'Ada', password: '' } })).toEqual({ name: 'Ada', password: '' })
  })

  it('only matches accounts from the users collection', () => {
    const data = { password: 'new-secret' }
    expect(run({ user: { ...resident, collection: 'other' }, data })).toBe(data)
  })
})
