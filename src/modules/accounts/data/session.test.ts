import type * as PayloadModule from 'payload'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// The users collection's own auth settings, unlike Payload's defaults in every field, so a cookie
// built from anything else (a copy, a default) fails here (#234: the Secure flag)
const authConfig = vi.hoisted(() => ({
  cookies: { sameSite: 'Strict', secure: true, domain: 'example.test' },
  tokenExpiration: 600,
}))
const edges = vi.hoisted(() => ({ login: vi.fn(), auth: vi.fn(), setCookie: vi.fn() }))

vi.mock('payload', async (importActual) => ({
  ...(await importActual<typeof PayloadModule>()),
  getPayload: async () => ({
    auth: edges.auth,
    login: edges.login,
    collections: { users: { config: { auth: authConfig } } },
    config: { cookiePrefix: 'payload' },
  }),
  logoutOperation: vi.fn(),
  createLocalReq: async () => ({}),
}))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/headers', () => ({
  headers: async () => new Headers(),
  cookies: async () => ({ set: edges.setCookie }),
}))

import { endSession, startSession } from './session'

beforeEach(() => {
  for (const fn of Object.values(edges)) fn.mockReset()
})

describe('startSession', () => {
  it('sets the cookie with the users collection’s own auth settings', async () => {
    edges.login.mockResolvedValue({ token: 'jwt' })
    await startSession({ email: 'ada@example.com', password: 'secret' })
    const [cookie] = edges.setCookie.mock.calls[0] ?? []
    expect(cookie).toMatchObject({
      name: 'payload-token',
      value: 'jwt',
      secure: true,
      sameSite: 'strict',
      domain: 'example.test',
    })
    expect(Math.round((cookie.expires.getTime() - Date.now()) / 60_000)).toBe(10)
  })
})

describe('endSession', () => {
  it('expires the cookie with the same settings, so the browser replaces the right one', async () => {
    edges.auth.mockResolvedValue({ user: null })
    await endSession()
    const [cookie] = edges.setCookie.mock.calls[0] ?? []
    expect(cookie).toMatchObject({
      name: 'payload-token',
      value: '',
      secure: true,
      sameSite: 'strict',
      domain: 'example.test',
    })
    expect(cookie.expires.getTime()).toBeLessThan(Date.now())
  })
})
