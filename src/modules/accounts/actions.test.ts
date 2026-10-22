import type * as PayloadModule from 'payload'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// The edges are replaced (Payload's operations and Next's request APIs); the actions, use cases,
// data functions and Payload's own cookie generators under them run for real.
const edges = vi.hoisted(() => ({
  auth: vi.fn(),
  update: vi.fn(),
  login: vi.fn(),
  logoutOperation: vi.fn(),
  setCookie: vi.fn(),
}))
// Payload's defaults for a collection with `auth: true`
const users = {
  config: { auth: { cookies: { sameSite: 'Lax', secure: false }, tokenExpiration: 7200 } },
}

vi.mock('payload', async (importActual) => ({
  ...(await importActual<typeof PayloadModule>()),
  getPayload: async () => ({
    auth: edges.auth,
    update: edges.update,
    login: edges.login,
    collections: { users },
    config: { cookiePrefix: 'payload' },
  }),
  createLocalReq: async ({ user }: { user: unknown }) => ({ user }),
  logoutOperation: edges.logoutOperation,
}))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ cookie: 'payload-token=abc' }),
  cookies: async () => ({ set: edges.setCookie }),
}))

import { changePassword, getSignedInAccount, signIn, signOut } from './actions'

// Payload's real errors, as its operations throw them
const { APIError, AuthenticationError, Forbidden, ValidationError } =
  await vi.importActual<typeof PayloadModule>('payload')

const resident = { id: 7, email: 'ada@example.com', name: 'Ada', role: 'resident', _sid: 's7' }
const password = 'correct-horse'

beforeEach(() => {
  for (const fn of Object.values(edges)) fn.mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('signIn', () => {
  it('signs in through Payload with the trimmed email and the password exactly as typed', async () => {
    edges.login.mockResolvedValue({ user: resident, token: 't' })
    const typed = ' Correct Horse '
    expect(await signIn({ email: ' Ada@example.com ', password: typed })).toEqual({ ok: true })
    expect(edges.login).toHaveBeenCalledWith({
      collection: 'users',
      data: { email: 'Ada@example.com', password: typed },
      overrideAccess: false,
    })
  })

  it('treats a sign-in that returns no token as a failure on our side, and sets no cookie', async () => {
    edges.login.mockResolvedValue({ user: resident })
    expect(await signIn({ email: 'ada@example.com', password })).toEqual({
      ok: false,
      failure: 'server-error',
    })
    expect(edges.setCookie).not.toHaveBeenCalled()
  })

  it('sets Payload’s auth cookie: httpOnly, Lax, for the whole site, for the token’s lifetime', async () => {
    edges.login.mockResolvedValue({ user: resident, token: 'jwt' })
    await signIn({ email: 'ada@example.com', password })
    const [cookie] = edges.setCookie.mock.calls[0] ?? []
    expect(cookie).toMatchObject({
      name: 'payload-token',
      value: 'jwt',
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: undefined, // no Secure flag, as Payload's REST login sets it locally
    })
    const minutesLeft = (cookie.expires.getTime() - Date.now()) / 60_000
    expect(Math.round(minutesLeft)).toBe(120)
  })

  it('sets no cookie when Payload refuses', async () => {
    edges.login.mockRejectedValue(new AuthenticationError())
    await signIn({ email: 'ada@example.com', password })
    expect(edges.setCookie).not.toHaveBeenCalled()
  })

  it('refuses input that doesn’t parse like a wrong password, without asking Payload', async () => {
    for (const input of [null, 'x', { email: '', password }, { email: 'a@example.com' }]) {
      expect(await signIn(input)).toEqual({ ok: false, failure: 'wrong-credentials' })
    }
    expect(edges.login).not.toHaveBeenCalled()
  })

  it('gives the same failure for every refusal, and a separate one for a server failure', async () => {
    edges.login.mockRejectedValueOnce(new AuthenticationError())
    expect(await signIn({ email: 'a@example.com', password })).toEqual({
      ok: false,
      failure: 'wrong-credentials',
    })
    edges.login.mockRejectedValueOnce(new APIError('Database down', 500))
    expect(await signIn({ email: 'a@example.com', password })).toEqual({
      ok: false,
      failure: 'server-error',
    })
    // Only the error's name: a database error would carry the email in its message
    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith('Sign-in failed on the server (APIError)')
  })
})

describe('changePassword', () => {
  const input = { newPassword: password, confirmPassword: password }

  it('changes the signed-in account’s own password, with access rules applied', async () => {
    edges.auth.mockResolvedValue({ user: resident })
    expect(await changePassword(input)).toEqual({ ok: true })
    expect(edges.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'users',
        id: 7,
        data: { password },
        overrideAccess: false,
        user: resident,
      }),
    )
  })

  it('refuses to name another account', async () => {
    edges.auth.mockResolvedValue({ user: resident })
    expect(await changePassword({ ...input, id: 1 })).toEqual({ ok: false, failure: 'rejected' })
    expect(await changePassword({ ...input, user: { id: 1 } })).toEqual({
      ok: false,
      failure: 'rejected',
    })
    expect(edges.update).not.toHaveBeenCalled()
  })

  it('checks the new password again on the server', async () => {
    edges.auth.mockResolvedValue({ user: resident })
    const short = { newPassword: 'short', confirmPassword: 'short' }
    const mismatch = { newPassword: password, confirmPassword: `${password}!` }
    expect(await changePassword(short)).toEqual({ ok: false, failure: 'rejected' })
    expect(await changePassword(mismatch)).toEqual({ ok: false, failure: 'rejected' })
    expect(edges.update).not.toHaveBeenCalled()
  })

  it('asks a visitor to sign in again, without changing anything', async () => {
    edges.auth.mockResolvedValue({ user: null })
    expect(await changePassword(input)).toEqual({ ok: false, failure: 'signed-out' })
    expect(edges.update).not.toHaveBeenCalled()
  })

  it('turns Payload’s refusals into fixed failures', async () => {
    edges.auth.mockResolvedValue({ user: resident })
    const invalid = new ValidationError({ errors: [{ message: 'Bad', path: 'password' }] })
    edges.update.mockRejectedValueOnce(invalid)
    expect(await changePassword(input)).toEqual({ ok: false, failure: 'rejected' })
    edges.update.mockRejectedValueOnce(new Forbidden())
    expect(await changePassword(input)).toEqual({ ok: false, failure: 'signed-out' })
    edges.update.mockRejectedValueOnce(new Error('Database down'))
    expect(await changePassword(input)).toEqual({ ok: false, failure: 'server-error' })
  })
})

describe('signOut', () => {
  /** The cookie set is Payload's expired auth cookie, with the same settings as the live one. */
  const expectExpiredCookie = () => {
    const [cookie] = edges.setCookie.mock.calls[0] ?? []
    expect(cookie).toMatchObject({
      name: 'payload-token',
      value: '',
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    })
    expect(cookie.expires.getTime()).toBeLessThan(Date.now())
  }

  it('ends the session in Payload and expires the auth cookie', async () => {
    edges.auth.mockResolvedValue({ user: resident })
    await signOut()
    expect(edges.logoutOperation).toHaveBeenCalledWith({
      collection: users,
      req: { user: resident },
    })
    expectExpiredCookie()
  })

  it('still expires the cookie when the session is already gone', async () => {
    edges.auth.mockResolvedValue({ user: null })
    await signOut()
    expect(edges.logoutOperation).not.toHaveBeenCalled()
    expectExpiredCookie()
  })

  it('still expires the cookie when Payload fails to forget the session', async () => {
    edges.auth.mockResolvedValue({ user: resident })
    edges.logoutOperation.mockRejectedValue(new Error('Database down'))
    await expect(signOut()).rejects.toThrow('Database down')
    expectExpiredCookie()
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
