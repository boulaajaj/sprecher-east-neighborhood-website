import type * as PayloadModule from 'payload'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CURRENT_PASSWORD_CONFIRMED } from './domain/passwordConfirmation'
import {
  edges,
  nextAuthWithEdges,
  nextHeadersWithEdges,
  payloadWithEdges,
  resetEdges,
  resident,
} from './testing/actionEdges'

vi.mock('payload', async (importActual) => payloadWithEdges(await importActual()))
vi.mock('@payloadcms/next/auth', () => nextAuthWithEdges())
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/headers', () => nextHeadersWithEdges())

import { changePassword } from './actions'

// Payload's real errors, as its operations throw them
const { APIError, AuthenticationError, Forbidden, LockedAuth, ValidationError } =
  await vi.importActual<typeof PayloadModule>('payload')

const currentPassword = 'old-horse'
const password = 'correct-horse'
const input = { currentPassword, newPassword: password, confirmPassword: password }

beforeEach(() => {
  resetEdges()
  edges.auth.mockResolvedValue({ user: resident })
})

describe('changePassword', () => {
  it('checks the current password, then changes the session account’s own password', async () => {
    edges.login.mockResolvedValue({ user: resident, token: 'other-session' })
    expect(await changePassword(input)).toEqual({ ok: true })
    // Payload's own check, for the session's account only, with access rules applied
    expect(edges.login).toHaveBeenCalledExactlyOnceWith({
      collection: 'users',
      data: { email: 'ada@example.com', password: currentPassword },
      overrideAccess: false,
    })
    expect(edges.update).toHaveBeenCalledExactlyOnceWith({
      collection: 'users',
      id: 7,
      data: { password },
      depth: 0,
      overrideAccess: false,
      user: resident, // with its session id, so Payload keeps this session and ends the others
      // Marks the change as confirmed, which the users collection requires (#233)
      context: { [CURRENT_PASSWORD_CONFIRMED]: true },
    })
    // The check's token is dropped: the browser keeps its own session cookie
    expect(edges.signInHelper).not.toHaveBeenCalled()
    expect(edges.deleteCookie).not.toHaveBeenCalled()
  })

  it.each([
    ['a wrong current password', new AuthenticationError()],
    ['a locked account', new LockedAuth()],
    ['a blank current password', new ValidationError({ errors: [{ message: 'x', path: 'p' }] })],
  ])('refuses %s with one failure, and changes nothing', async (_, error) => {
    edges.login.mockRejectedValue(error)
    expect(await changePassword(input)).toEqual({ ok: false, failure: 'wrong-password' })
    expect(edges.update).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  it('checks the passwords again on the server, and refuses to name another account', async () => {
    for (const values of [
      { currentPassword, newPassword: 'short', confirmPassword: 'short' },
      { ...input, confirmPassword: `${password}!` },
      { newPassword: password, confirmPassword: password },
      { ...input, id: 1 },
      { ...input, user: { id: 1 } },
      { ...input, email: 'grace@example.com' },
      { ...input, context: { [CURRENT_PASSWORD_CONFIRMED]: true } },
    ]) {
      expect(await changePassword(values)).toEqual({ ok: false, failure: 'rejected' })
    }
    expect(edges.login).not.toHaveBeenCalled()
    expect(edges.update).not.toHaveBeenCalled()
  })

  it('asks a visitor to sign in again, without checking or changing anything', async () => {
    edges.auth.mockResolvedValue({ user: null })
    expect(await changePassword(input)).toEqual({ ok: false, failure: 'signed-out' })
    expect(edges.login).not.toHaveBeenCalled()
    expect(edges.update).not.toHaveBeenCalled()
  })

  it('turns the other failures into fixed ones, and logs only the error’s name', async () => {
    // Checking the current password fails on our side: nothing changes
    edges.login.mockRejectedValueOnce(new APIError('Database down', 500))
    expect(await changePassword(input)).toEqual({ ok: false, failure: 'server-error' })
    expect(edges.update).not.toHaveBeenCalled()
    // Payload refuses the new password, or the update fails
    edges.login.mockResolvedValue({ user: resident, token: 'unused' })
    const invalid = new ValidationError({ errors: [{ message: 'Bad', path: 'password' }] })
    edges.update.mockRejectedValueOnce(invalid)
    expect(await changePassword(input)).toEqual({ ok: false, failure: 'rejected' })
    edges.update.mockRejectedValueOnce(new Forbidden())
    expect(await changePassword(input)).toEqual({ ok: false, failure: 'signed-out' })
    edges.update.mockRejectedValueOnce(new Error('Database down'))
    expect(await changePassword(input)).toEqual({ ok: false, failure: 'server-error' })
    // Never the error itself: a database error on this update would carry the password hash
    expect(vi.mocked(console.error).mock.calls).toEqual([
      ['Password change failed on the server (APIError)'],
      ['Password change failed on the server (Error)'],
    ])
  })
})
