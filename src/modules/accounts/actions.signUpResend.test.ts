import type * as PayloadModule from 'payload'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  edges,
  nextAuthWithEdges,
  nextHeadersWithEdges,
  nextServerWithEdges,
  payloadWithEdges,
  resetEdges,
  robotCheckWithEdges,
  runAfterTasks,
} from './testing/actionEdges'

vi.mock('payload', async (importActual) => payloadWithEdges(await importActual()))
vi.mock('@payloadcms/next/auth', () => nextAuthWithEdges())
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/headers', () => nextHeadersWithEdges())
vi.mock('next/server', async (importActual) => nextServerWithEdges(await importActual()))
vi.mock('@/platform/turnstile/turnstileVerifier', () => robotCheckWithEdges())

import { signUp } from './actions'

// Payload's real errors, as its operations throw them
const { ValidationError } = await vi.importActual<typeof PayloadModule>('payload')

// Each test starts in a fresh hour, so the limits only count that test's sign-ups
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

const password = 'correct-horse'
const input = {
  name: ' Ana ',
  email: ' Ana@Example.com ',
  newPassword: password,
  confirmPassword: password,
}

const duplicate = () =>
  new ValidationError({
    errors: [{ message: 'A user with the given email is already registered.', path: 'email' }],
  })

// A sign-up for an email whose account isn't verified yet resends its link, up to the cap (#289)
describe('signUp: resending a lost verification link', () => {
  beforeEach(() => {
    edges.create.mockRejectedValue(duplicate())
  })

  it('resends a new verification link to an unverified account, after the answer (#289)', async () => {
    edges.find.mockResolvedValue({
      docs: [{ id: 9, email: 'ana@example.com', _verified: false, verificationResends: 0 }],
    })
    expect(await signUp(input)).toEqual({ ok: true })
    expect(edges.find).not.toHaveBeenCalled()
    await runAfterTasks()

    expect(edges.find).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        collection: 'users',
        where: { email: { equals: 'ana@example.com' } },
        overrideAccess: true,
        showHiddenFields: true,
      }),
    )
    const update = edges.dbUpdateOne.mock.calls[0]?.[0]
    expect(update).toMatchObject({
      collection: 'users',
      id: 9,
      data: { verificationResends: 1, verificationResendsSince: new Date().toISOString() },
    })
    const token = update.data._verificationToken
    expect(token).toMatch(/^[0-9a-f]{40}$/)
    expect(edges.sendEmail).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        to: 'ana@example.com',
        subject: 'Confirm your email to finish your Sprecher East account',
      }),
    )
    expect(edges.sendEmail.mock.calls[0]?.[0].html).toContain(`/verify-account?token=${token}`)
  })

  it('stops resending after three in three hours, without saying so', async () => {
    edges.find.mockResolvedValue({
      docs: [
        {
          id: 9,
          email: 'ana@example.com',
          _verified: false,
          verificationResends: 3,
          verificationResendsSince: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
      ],
    })
    expect(await signUp(input)).toEqual({ ok: true })
    await runAfterTasks()
    expect(edges.sendEmail).not.toHaveBeenCalled()
    expect(edges.dbUpdateOne).not.toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalledWith('Sign-up verification resend capped for an account')
  })

  it('logs only the error’s name when a resend fails', async () => {
    edges.find.mockResolvedValue({ docs: [{ id: 9, email: 'ana@example.com', _verified: false }] })
    edges.dbUpdateOne.mockResolvedValue(undefined)
    edges.sendEmail.mockRejectedValue(new Error('SMTP down for ana@example.com'))
    expect(await signUp(input)).toEqual({ ok: true })
    await runAfterTasks()
    expect(console.error).toHaveBeenCalledExactlyOnceWith(
      'Sign-up verification resend failed on the server (Error)',
    )
  })
})
