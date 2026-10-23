import type * as PayloadModule from 'payload'
import { vi } from 'vitest'

// For the server action tests: the edges are replaced (Payload's operations and Next's request
// APIs); the actions, use cases, data functions and Payload's own cookie generators under them
// run for real. A test file mocks with these factories, then imports the actions:
//
//   vi.mock('payload', async (importActual) => payloadWithEdges(await importActual()))
//   vi.mock('@payload-config', () => ({ default: {} }))
//   vi.mock('next/headers', () => nextHeadersWithEdges())

export const edges = {
  auth: vi.fn(),
  update: vi.fn(),
  login: vi.fn(),
  logoutOperation: vi.fn(),
  setCookie: vi.fn(),
}

/** Payload's defaults for a collection with `auth: true` */
export const users = {
  config: { auth: { cookies: { sameSite: 'Lax', secure: false }, tokenExpiration: 7200 } },
}

export const payloadWithEdges = (actual: typeof PayloadModule) => ({
  ...actual,
  getPayload: async () => ({
    auth: edges.auth,
    update: edges.update,
    login: edges.login,
    collections: { users },
    config: { cookiePrefix: 'payload' },
  }),
  createLocalReq: async ({ user }: { user: unknown }) => ({ user }),
  logoutOperation: edges.logoutOperation,
})

export const nextHeadersWithEdges = () => ({
  headers: async () => new Headers({ cookie: 'payload-token=abc' }),
  cookies: async () => ({ set: edges.setCookie }),
})

/** The signed-in resident, as `payload.auth` returns it (with its session id) */
export const resident = {
  id: 7,
  email: 'ada@example.com',
  name: 'Ada',
  role: 'resident',
  _sid: 's7',
}

/** Resets every edge and silences (and records) the server log. */
export function resetEdges() {
  for (const fn of Object.values(edges)) fn.mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => {})
}
