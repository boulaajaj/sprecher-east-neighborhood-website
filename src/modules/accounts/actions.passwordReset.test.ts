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

import { forgotPassword, resetPassword } from './actions'

// Payload's real errors, as its operations throw them
const { APIError, ValidationError } = await vi.importActual<typeof PayloadModule>('payload')

beforeEach(resetEdges)

describe('forgotPassword', () => {
  it('asks Payload to email a reset link for the trimmed email, as its REST endpoint does', async () => {
    edges.forgotPassword.mockResolvedValue('token')
    expect(await forgotPassword({ email: ' ada@example.com ' })).toEqual({ ok: true })
    expect(edges.forgotPassword).toHaveBeenCalledExactlyOnceWith({
      collection: 'users',
      data: { email: 'ada@example.com' },
      overrideAccess: false,
    })
  })

  it('gives the same answer when no account uses the email (Payload returns nothing)', async () => {
    edges.forgotPassword.mockResolvedValue(null)
    expect(await forgotPassword({ email: 'nobody@example.com' })).toEqual({ ok: true })
  })

  it('gives the same answer when sending fails, and logs only the error’s name', async () => {
    edges.forgotPassword.mockRejectedValue(new APIError('SMTP down for ada@example.com', 500))
    expect(await forgotPassword({ email: 'ada@example.com' })).toEqual({ ok: true })
    expect(console.error).toHaveBeenCalledExactlyOnceWith(
      'Password reset request failed on the server (APIError)',
    )
  })

  it('refuses input that doesn’t parse, without asking Payload', async () => {
    for (const input of [null, 'x', { email: '' }, { email: 'a@example.com', role: 'admin' }]) {
      expect(await forgotPassword(input)).toEqual({ ok: false, failure: 'rejected' })
    }
    expect(edges.forgotPassword).not.toHaveBeenCalled()
  })
})

describe('resetPassword', () => {
  const token = '0123456789abcdef0123456789abcdef01234567'
  const password = 'correct-horse'
  const input = { token, newPassword: password, confirmPassword: password }

  it('sets the new password with Payload’s reset operation and the link’s token', async () => {
    edges.resetPassword.mockResolvedValue({ token: 'session', user: {} })
    expect(await resetPassword(input)).toEqual({ ok: true })
    expect(edges.resetPassword).toHaveBeenCalledExactlyOnceWith({
      collection: 'users',
      data: { token, password },
      overrideAccess: false,
    })
    // No session cookie from the reset: the person signs in with the new password next
    expect(edges.signInHelper).not.toHaveBeenCalled()
  })

  it('reads an unknown, used or expired token as a dead link', async () => {
    edges.resetPassword.mockRejectedValue(
      new APIError('Token is either invalid or has expired.', 403),
    )
    expect(await resetPassword(input)).toEqual({ ok: false, failure: 'invalid-link' })
    expect(console.error).not.toHaveBeenCalled()
  })

  it('says the password was refused when Payload rejects it', async () => {
    edges.resetPassword.mockRejectedValue(
      new ValidationError({ errors: [{ message: 'x', path: 'password' }] }),
    )
    expect(await resetPassword(input)).toEqual({ ok: false, failure: 'rejected' })
  })

  it('logs only the error’s name when it fails on our side', async () => {
    edges.resetPassword.mockRejectedValue(new APIError('Database down', 500))
    expect(await resetPassword(input)).toEqual({ ok: false, failure: 'server-error' })
    expect(console.error).toHaveBeenCalledExactlyOnceWith(
      'Password reset failed on the server (APIError)',
    )
  })

  it('refuses input that doesn’t parse, without asking Payload', async () => {
    for (const values of [
      null,
      { ...input, token: '' },
      { ...input, confirmPassword: 'different' },
      { ...input, newPassword: 'short', confirmPassword: 'short' },
      { ...input, email: 'a@example.com' },
    ]) {
      expect(await resetPassword(values)).toEqual({ ok: false, failure: 'rejected' })
    }
    expect(edges.resetPassword).not.toHaveBeenCalled()
  })
})
