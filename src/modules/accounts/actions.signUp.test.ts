import type * as PayloadModule from 'payload'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  edges,
  nextAuthWithEdges,
  nextHeadersWithEdges,
  payloadWithEdges,
  requestHeaders,
  resetEdges,
} from './testing/actionEdges'

// The robot check (Cloudflare Turnstile), replaced: on, and passing unless a test says otherwise
const robotCheck = vi.hoisted(() => ({ enabled: true, verify: vi.fn() }))
vi.mock('@/platform/turnstile/turnstileVerifier', () => ({
  TurnstileVerifier: class {
    isEnabled = () => robotCheck.enabled
    verify = robotCheck.verify
  },
}))

vi.mock('payload', async (importActual) => payloadWithEdges(await importActual()))
vi.mock('@payloadcms/next/auth', () => nextAuthWithEdges())
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/headers', () => nextHeadersWithEdges())

import { signUp, verifyAccount } from './actions'

// Payload's real errors, as its operations throw them
const { APIError, ValidationError } = await vi.importActual<typeof PayloadModule>('payload')

// Each test starts in a fresh hour, so the limits only count that test's sign-ups
let hour = 0
beforeEach(() => {
  resetEdges()
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  robotCheck.enabled = true
  robotCheck.verify.mockReset().mockResolvedValue({ ok: true })
  hour += 2
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(Date.UTC(2026, 9, 23, hour))
})
afterEach(() => {
  vi.useRealTimers()
})

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
    edges.delete.mockResolvedValue({ docs: [] })
    expect(await signUp(input)).toEqual({ ok: true })
    expect(console.error).toHaveBeenCalledExactlyOnceWith('Sign-up failed on the server (Error)')
  })

  it('removes the unverified account it just stored when the verification email fails', async () => {
    edges.create.mockRejectedValue(new Error('SMTP down'))
    edges.delete.mockResolvedValue({ docs: [{ id: 9 }] })
    await signUp(input)
    expect(edges.delete).toHaveBeenCalledExactlyOnceWith({
      collection: 'users',
      where: {
        and: [
          { email: { equals: 'ana@example.com' } },
          { _verified: { not_equals: true } },
          { createdAt: { greater_than_equal: new Date().toISOString() } },
        ],
      },
      depth: 0,
      overrideAccess: true,
    })
  })

  it('never removes an account when Payload refuses a duplicate email', async () => {
    edges.create.mockRejectedValue(
      new ValidationError({ errors: [{ message: 'Taken', path: 'email' }] }),
    )
    await signUp(input)
    expect(edges.delete).not.toHaveBeenCalled()
  })

  it('still answers the same when removing the failed account fails too', async () => {
    edges.create.mockRejectedValue(new Error('SMTP down'))
    edges.delete.mockRejectedValue(new Error('Database locked'))
    expect(await signUp(input)).toEqual({ ok: true })
    expect(console.error).toHaveBeenLastCalledWith('Sign-up cleanup failed on the server (Error)')
  })

  it('sends the robot-check token to the check, and refuses before Payload when it fails', async () => {
    edges.create.mockResolvedValue({ id: 9 })
    await signUp(input, 'token-1')
    expect(robotCheck.verify).toHaveBeenCalledExactlyOnceWith('token-1')

    robotCheck.verify.mockResolvedValue({ ok: false, reason: 'missing-token' })
    expect(await signUp(input)).toEqual({ ok: false, failure: 'robot-check' })
    expect(robotCheck.verify).toHaveBeenLastCalledWith(null)
    expect(edges.create).toHaveBeenCalledTimes(1)
  })

  it('skips the robot check when it isn’t configured', async () => {
    robotCheck.enabled = false
    edges.create.mockResolvedValue({ id: 9 })
    expect(await signUp(input)).toEqual({ ok: true })
    expect(robotCheck.verify).not.toHaveBeenCalled()
  })

  it('allows five attempts an hour from one connection, then refuses before the check', async () => {
    edges.create.mockResolvedValue({ id: 9 })
    requestHeaders.set('x-forwarded-for', '203.0.113.7')
    for (let i = 0; i < 5; i++) expect(await signUp(input)).toEqual({ ok: true })
    expect(await signUp(input)).toEqual({ ok: false, failure: 'too-many' })
    expect(robotCheck.verify).toHaveBeenCalledTimes(5)
    // Another connection still gets through
    requestHeaders.set('x-forwarded-for', '203.0.113.8')
    expect(await signUp(input)).toEqual({ ok: true })
    // An hour later, the first connection can try again
    vi.setSystemTime(Date.now() + 60 * 60 * 1000)
    requestHeaders.set('x-forwarded-for', '203.0.113.7')
    expect(await signUp(input)).toEqual({ ok: true })
  })

  it('creates at most twenty accounts an hour site-wide', async () => {
    edges.create.mockResolvedValue({ id: 9 })
    for (let i = 0; i < 20; i++) {
      requestHeaders.set('x-forwarded-for', `198.51.100.${i}`)
      expect(await signUp(input)).toEqual({ ok: true })
    }
    requestHeaders.set('x-forwarded-for', '198.51.100.99')
    expect(await signUp(input)).toEqual({ ok: false, failure: 'too-many' })
    expect(edges.create).toHaveBeenCalledTimes(20)
  })

  it('doesn’t count failed robot checks against the site-wide limit', async () => {
    robotCheck.verify.mockResolvedValue({ ok: false, reason: 'bad' })
    for (let i = 0; i < 25; i++) {
      requestHeaders.set('x-forwarded-for', `192.0.2.${i}`)
      await signUp(input)
    }
    robotCheck.verify.mockResolvedValue({ ok: true })
    edges.create.mockResolvedValue({ id: 9 })
    expect(await signUp(input)).toEqual({ ok: true })
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
