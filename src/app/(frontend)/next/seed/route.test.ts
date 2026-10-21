import { beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from './route'

const { auth, seed } = vi.hoisted(() => ({ auth: vi.fn(), seed: vi.fn() }))

vi.mock('payload', () => ({
  getPayload: async () => ({ auth, logger: { error: vi.fn() } }),
  createLocalReq: async () => ({}),
}))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/endpoints/seed', () => ({ seed }))
vi.mock('next/headers', () => ({ headers: async () => new Headers() }))

const user = (role: string) => ({ id: 1, role, collection: 'users' })

beforeEach(() => {
  auth.mockReset()
  seed.mockReset()
})

describe('POST /next/seed', () => {
  it.each([
    ['a visitor', null],
    ['a resident', user('resident')],
    ['an editor', user('editor')],
  ])('refuses %s without touching the data', async (_, signedIn) => {
    auth.mockResolvedValue({ user: signedIn })
    const response = await POST()
    expect(response.status).toBe(403)
    expect(seed).not.toHaveBeenCalled()
  })

  it('does not exist on the live site, even for an admin', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    auth.mockResolvedValue({ user: user('admin') })
    const response = await POST()
    expect(response.status).toBe(404)
    expect(auth).not.toHaveBeenCalled()
    expect(seed).not.toHaveBeenCalled()
  })

  it('runs the seed for an admin in local development', async () => {
    auth.mockResolvedValue({ user: user('admin') })
    const response = await POST()
    expect(response.status).toBe(200)
    expect(seed).toHaveBeenCalledTimes(1)
  })
})
