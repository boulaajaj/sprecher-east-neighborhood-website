import type * as PayloadModule from 'payload'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  edges,
  nextAuthWithEdges,
  nextHeadersWithEdges,
  nextServerWithEdges,
  payloadWithEdges,
  requestHeaders,
  resetEdges,
  robotCheck,
  robotCheckWithEdges,
  runAfterTasks,
} from './testing/actionEdges'

vi.mock('payload', async (importActual) => payloadWithEdges(await importActual()))
vi.mock('@payloadcms/next/auth', () => nextAuthWithEdges())
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/headers', () => nextHeadersWithEdges())
vi.mock('next/server', async (importActual) => nextServerWithEdges(await importActual()))
vi.mock('@/platform/turnstile/turnstileVerifier', () => robotCheckWithEdges())

import { forgotPassword, resetPassword } from './actions'

// Payload's real errors, as its operations throw them
const { APIError, ValidationError } = await vi.importActual<typeof PayloadModule>('payload')

// Each test starts in a fresh hour, so the limits only count that test's requests
let hour = 0
beforeEach(() => {
  resetEdges()
  hour += 2
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(Date.UTC(2026, 9, 23, hour))
})
afterEach(() => {
  vi.useRealTimers()
})

describe('forgotPassword', () => {
  it('asks Payload to email a reset link for the trimmed email, after answering', async () => {
    edges.forgotPassword.mockResolvedValue('token')
    expect(await forgotPassword({ email: ' ada@example.com ' }, 'token-1')).toEqual({ ok: true })
    // The answer comes first: Payload hasn't been asked yet, whatever the email
    expect(edges.forgotPassword).not.toHaveBeenCalled()
    await runAfterTasks()
    expect(edges.forgotPassword).toHaveBeenCalledExactlyOnceWith({
      collection: 'users',
      data: { email: 'ada@example.com' },
      overrideAccess: false,
    })
    expect(robotCheck.verify).toHaveBeenCalledExactlyOnceWith('token-1')
  })

  it('answers before Payload looks the email up, so the time doesn’t depend on it', async () => {
    // Payload's lookup and email would take long for an existing account: none of it is awaited
    edges.forgotPassword.mockImplementation(() => new Promise(() => {}))
    expect(await forgotPassword({ email: 'ada@example.com' })).toEqual({ ok: true })
    expect(await forgotPassword({ email: 'nobody@example.com' })).toEqual({ ok: true })
    expect(edges.forgotPassword).not.toHaveBeenCalled()
  })

  it('gives the same answer when no account uses the email (Payload returns nothing)', async () => {
    edges.forgotPassword.mockResolvedValue(null)
    expect(await forgotPassword({ email: 'nobody@example.com' })).toEqual({ ok: true })
    await runAfterTasks()
  })

  it('gives the same answer when sending fails, and logs only the error’s name', async () => {
    edges.forgotPassword.mockRejectedValue(new APIError('SMTP down for ada@example.com', 500))
    expect(await forgotPassword({ email: 'ada@example.com' })).toEqual({ ok: true })
    await runAfterTasks()
    expect(console.error).toHaveBeenCalledExactlyOnceWith(
      'Password reset request failed on the server (APIError)',
    )
  })

  it('refuses before Payload when the robot check fails', async () => {
    robotCheck.verify.mockResolvedValue({ ok: false, reason: 'missing-token' })
    expect(await forgotPassword({ email: 'ada@example.com' })).toEqual({
      ok: false,
      failure: 'robot-check',
    })
    expect(robotCheck.verify).toHaveBeenCalledWith(null)
    await runAfterTasks()
    expect(edges.forgotPassword).not.toHaveBeenCalled()
  })

  it('allows five requests an hour from one connection, then refuses before the check', async () => {
    edges.forgotPassword.mockResolvedValue(null)
    requestHeaders.set('x-forwarded-for', '203.0.113.7')
    for (let i = 0; i < 5; i++) {
      expect(await forgotPassword({ email: 'ada@example.com' })).toEqual({ ok: true })
    }
    expect(await forgotPassword({ email: 'ada@example.com' })).toEqual({
      ok: false,
      failure: 'too-many',
    })
    expect(robotCheck.verify).toHaveBeenCalledTimes(5)
    requestHeaders.set('x-forwarded-for', '203.0.113.8')
    expect(await forgotPassword({ email: 'ada@example.com' })).toEqual({ ok: true })
  })

  it('sends at most thirty requests an hour site-wide on to Payload', async () => {
    edges.forgotPassword.mockResolvedValue(null)
    for (let i = 0; i < 30; i++) {
      requestHeaders.set('x-forwarded-for', `198.51.100.${i}`)
      expect(await forgotPassword({ email: 'ada@example.com' })).toEqual({ ok: true })
    }
    requestHeaders.set('x-forwarded-for', '198.51.100.99')
    expect(await forgotPassword({ email: 'ada@example.com' })).toEqual({
      ok: false,
      failure: 'too-many',
    })
    await runAfterTasks()
    expect(edges.forgotPassword).toHaveBeenCalledTimes(30)
  })

  it('refuses input that doesn’t parse, without asking Payload', async () => {
    for (const input of [null, 'x', { email: '' }, { email: 'a@example.com', role: 'admin' }]) {
      expect(await forgotPassword(input)).toEqual({ ok: false, failure: 'rejected' })
    }
    await runAfterTasks()
    expect(edges.forgotPassword).not.toHaveBeenCalled()
    expect(robotCheck.verify).not.toHaveBeenCalled()
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
