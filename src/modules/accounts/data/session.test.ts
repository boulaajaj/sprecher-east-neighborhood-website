import type * as PayloadModule from 'payload'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// The users collection's own auth settings, unlike Payload's defaults in every field, so a cookie
// named or scoped from anything else (a copy, a default) fails here
const authConfig = vi.hoisted(() => ({
  cookies: { sameSite: 'Strict', secure: true, domain: 'example.test' },
  tokenExpiration: 600,
}))
const edges = vi.hoisted(() => ({ auth: vi.fn(), deleteCookie: vi.fn() }))

vi.mock('payload', async (importActual) => ({
  ...(await importActual<typeof PayloadModule>()),
  getPayload: async () => ({
    auth: edges.auth,
    collections: { users: { config: { auth: authConfig } } },
    config: { cookiePrefix: 'site' },
  }),
  logoutOperation: vi.fn(),
  createLocalReq: async () => ({}),
}))
vi.mock('@payloadcms/next/auth', () => ({ login: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/headers', () => ({
  headers: async () => new Headers(),
  cookies: async () => ({ delete: edges.deleteCookie }),
}))

import { endSession } from './session'

beforeEach(() => {
  for (const fn of Object.values(edges)) fn.mockReset()
})

describe('endSession', () => {
  it('deletes the auth cookie by the name, domain and path Payload gives it', async () => {
    edges.auth.mockResolvedValue({ user: null })
    await endSession()
    expect(edges.deleteCookie).toHaveBeenCalledExactlyOnceWith({
      name: 'site-token',
      domain: 'example.test',
      path: '/',
      secure: true,
    })
  })
})
