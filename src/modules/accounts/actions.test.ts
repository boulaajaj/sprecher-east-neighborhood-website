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
const { APIError, AuthenticationError, Forbidden, LockedAuth, ValidationError } =
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
  const currentPassword = 'old-horse'
  const input = { currentPassword, newPassword: password, confirmPassword: password }
  beforeEach(() => {
    edges.auth.mockResolvedValue({ user: resident })
  })

  it('checks the current password, then changes the session account’s own password', async () => {
    edges.login.mockResolvedValue({ user: resident, token: 'other-session' })
    expect(await changePassword(input)).toEqual({ ok: true })
    // Payload's own check, for the session's account only, with access rules applied
    expect(edges.login).toHaveBeenCalledExactlyOnceWith({
      collection: 'users',
      data: { email: 'ada@example.com', password: currentPassword },
      overrideAccess: false,
    })
    expect(edges.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'users',
        id: 7,
        data: { password },
        overrideAccess: false,
        user: resident, // with its session id, so Payload keeps this session and ends the others
      }),
    )
    // The check's token is dropped: the browser keeps its own session cookie
    expect(edges.setCookie).not.toHaveBeenCalled()
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
