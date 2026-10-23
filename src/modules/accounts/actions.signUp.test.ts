import type * as PayloadModule from 'payload'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  edges,
  nextAuthWithEdges,
  nextHeadersWithEdges,
  payloadWithEdges,
  resetEdges,
} from './testing/actionEdges'

vi.mock('payload', async (importActual) => payloadWithEdges(await importActual()))
vi.mock('@payloadcms/next/auth', () => nextAuthWithEdges())
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/headers', () => nextHeadersWithEdges())

import { signUp, verifyAccount } from './actions'

// Payload's real errors, as its operations throw them
const { APIError, ValidationError } = await vi.importActual<typeof PayloadModule>('payload')

beforeEach(resetEdges)

const password = 'correct-horse'
const input = {
  name: ' Ana ',
  email: ' Ana@Example.com ',
  newPassword: password,
  confirmPassword: password,
}

describe('signUp', () => {
  it('creates a resident with Payload’s create, which emails the verification link', async () => {
    edges.create.mockResolvedValue({ id: 9 })
    expect(await signUp(input)).toEqual({ ok: true })
    expect(edges.create).toHaveBeenCalledExactlyOnceWith({
      collection: 'users',
      data: { name: 'Ana', email: 'ana@example.com', password, role: 'resident' },
      depth: 0,
      overrideAccess: true,
    })
    // No session: the account can't sign in until its email is verified
    expect(edges.signInHelper).not.toHaveBeenCalled()
  })

  it('always makes a resident, whatever role or flag the caller sends', async () => {
    for (const extra of [{ role: 'admin' }, { role: 'editor' }, { _verified: true }]) {
      expect(await signUp({ ...input, ...extra })).toEqual({ ok: false, failure: 'rejected' })
    }
    expect(edges.create).not.toHaveBeenCalled()
    edges.create.mockResolvedValue({ id: 9 })
    await signUp(input)
    expect(edges.create.mock.calls[0]?.[0].data.role).toBe('resident')
    expect(Object.keys(edges.create.mock.calls[0]?.[0].data).sort()).toEqual([
      'email',
      'name',
      'password',
      'role',
    ])
  })

  it('answers the same when an account already uses the email, and logs nothing', async () => {
    edges.create.mockRejectedValue(
      new ValidationError({
        errors: [{ message: 'A user with the given email is already registered.', path: 'email' }],
      }),
    )
    expect(await signUp(input)).toEqual({ ok: true })
    expect(console.error).not.toHaveBeenCalled()
  })

  it('answers the same when it fails on our side, and logs only the error’s name', async () => {
    edges.create.mockRejectedValue(new Error('SMTP down for ana@example.com'))
    expect(await signUp(input)).toEqual({ ok: true })
    expect(console.error).toHaveBeenCalledExactlyOnceWith('Sign-up failed on the server (Error)')
  })

  it('refuses input that doesn’t parse, without asking Payload', async () => {
    for (const values of [
      null,
      { ...input, name: ' ' },
      { ...input, email: 'not-an-email' },
      { ...input, email: 'a@example.com, b@example.com' },
      { ...input, confirmPassword: 'different' },
      { ...input, newPassword: 'short', confirmPassword: 'short' },
    ]) {
      expect(await signUp(values)).toEqual({ ok: false, failure: 'rejected' })
    }
    expect(edges.create).not.toHaveBeenCalled()
  })
})

describe('verifyAccount', () => {
  const token = '0123456789abcdef0123456789abcdef01234567'

  it('verifies the account with Payload’s verifyEmail and the link’s token', async () => {
    edges.verifyEmail.mockResolvedValue(true)
    expect(await verifyAccount({ token })).toEqual({ ok: true })
    expect(edges.verifyEmail).toHaveBeenCalledExactlyOnceWith({ collection: 'users', token })
    expect(edges.signInHelper).not.toHaveBeenCalled()
  })

  it('reads an unknown or used token as a dead link', async () => {
    edges.verifyEmail.mockRejectedValue(new APIError('Verification token is invalid.', 403))
    expect(await verifyAccount({ token })).toEqual({ ok: false, failure: 'invalid-link' })
    expect(console.error).not.toHaveBeenCalled()
  })

  it('logs only the error’s name when it fails on our side', async () => {
    edges.verifyEmail.mockRejectedValue(new APIError('Database down', 500))
    expect(await verifyAccount({ token })).toEqual({ ok: false, failure: 'server-error' })
    expect(console.error).toHaveBeenCalledExactlyOnceWith(
      'Account verification failed on the server (APIError)',
    )
  })

  it('reads input that doesn’t parse as a dead link, without asking Payload', async () => {
    for (const values of [null, { token: '' }, { token, email: 'a@example.com' }]) {
      expect(await verifyAccount(values)).toEqual({ ok: false, failure: 'invalid-link' })
    }
    expect(edges.verifyEmail).not.toHaveBeenCalled()
  })
})
