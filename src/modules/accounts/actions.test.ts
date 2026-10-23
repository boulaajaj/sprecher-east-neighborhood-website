import type * as PayloadModule from 'payload'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  edges,
  nextAuthWithEdges,
  nextHeadersWithEdges,
  payloadWithEdges,
  resetEdges,
  resident,
  users,
} from './testing/actionEdges'

vi.mock('payload', async (importActual) => payloadWithEdges(await importActual()))
vi.mock('@payloadcms/next/auth', () => nextAuthWithEdges())
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/headers', () => nextHeadersWithEdges())

import { getSignedInAccount, signIn, signOut } from './actions'

// Payload's real errors, as its operations throw them
const { APIError, AuthenticationError } = await vi.importActual<typeof PayloadModule>('payload')

const password = 'correct-horse'

beforeEach(resetEdges)

// changePassword: actions.changePassword.test.ts

describe('signIn', () => {
  it('signs in with Payload’s own helper, the trimmed email and the password exactly as typed', async () => {
    edges.signInHelper.mockResolvedValue({ user: resident, token: 't' })
    const typed = ' Correct Horse '
    expect(await signIn({ email: ' Ada@example.com ', password: typed })).toEqual({ ok: true })
    // The helper runs Payload's login operation and sets the auth cookie from the users
    // collection's auth settings (@payloadcms/next 3.91, utilities/setPayloadAuthCookie)
    expect(edges.signInHelper).toHaveBeenCalledExactlyOnceWith({
      collection: 'users',
      config: {},
      email: 'Ada@example.com',
      password: typed,
    })
  })

  it('refuses input that doesn’t parse like a wrong password, without asking Payload', async () => {
    for (const input of [null, 'x', { email: '', password }, { email: 'a@example.com' }]) {
      expect(await signIn(input)).toEqual({ ok: false, failure: 'wrong-credentials' })
    }
    expect(edges.signInHelper).not.toHaveBeenCalled()
  })

  it('gives the same failure for every refusal, and a separate one for a server failure', async () => {
    edges.signInHelper.mockRejectedValueOnce(new AuthenticationError())
    expect(await signIn({ email: 'a@example.com', password })).toEqual({
      ok: false,
      failure: 'wrong-credentials',
    })
    edges.signInHelper.mockRejectedValueOnce(new APIError('Database down', 500))
    expect(await signIn({ email: 'a@example.com', password })).toEqual({
      ok: false,
      failure: 'server-error',
    })
    // Only the error's name: a database error would carry the email in its message
    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith('Sign-in failed on the server (APIError)')
  })
})

describe('signOut', () => {
  /** The auth cookie is deleted by its own name and path, never another `payload…` cookie. */
  const expectAuthCookieDeleted = () => {
    expect(edges.deleteCookie).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ name: 'payload-token', path: '/' }),
    )
  }

  it('ends the session in Payload and deletes the auth cookie', async () => {
    edges.auth.mockResolvedValue({ user: resident })
    await signOut()
    expect(edges.logoutOperation).toHaveBeenCalledWith({
      collection: users,
      req: { user: resident },
    })
    expectAuthCookieDeleted()
  })

  it('still deletes the cookie when the session is already gone', async () => {
    edges.auth.mockResolvedValue({ user: null })
    await signOut()
    expect(edges.logoutOperation).not.toHaveBeenCalled()
    expectAuthCookieDeleted()
  })

  it('still deletes the cookie when Payload fails to forget the session', async () => {
    edges.auth.mockResolvedValue({ user: resident })
    edges.logoutOperation.mockRejectedValue(new Error('Database down'))
    await expect(signOut()).rejects.toThrow('Database down')
    expectAuthCookieDeleted()
  })
})

describe('getSignedInAccount', () => {
  it('gives the header only the account’s name', async () => {
    edges.auth.mockResolvedValue({ user: resident })
    expect(await getSignedInAccount()).toEqual({ name: 'Ada' })
  })

  it('is null for a visitor', async () => {
    edges.auth.mockResolvedValue({ user: null })
    expect(await getSignedInAccount()).toBeNull()
  })
})
