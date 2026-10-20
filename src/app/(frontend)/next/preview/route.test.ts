import type { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

const { auth, draft, redirect } = vi.hoisted(() => ({
  auth: vi.fn(),
  draft: { enable: vi.fn(), disable: vi.fn() },
  redirect: vi.fn(),
}))

vi.mock('payload', () => ({ getPayload: async () => ({ auth, logger: { error: vi.fn() } }) }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/headers', () => ({ draftMode: async () => draft }))
vi.mock('next/navigation', () => ({ redirect }))

const user = (role: string) => ({ id: 1, role, collection: 'users' })

const previewRequest = () =>
  new Request(
    'https://sprechereast.example/next/preview?path=/posts/hello&collection=posts&slug=hello&previewSecret=s3cret',
  ) as unknown as NextRequest

beforeEach(() => {
  vi.stubEnv('PREVIEW_SECRET', 's3cret')
  for (const fn of [auth, draft.enable, draft.disable, redirect]) fn.mockReset()
})

describe('GET /next/preview', () => {
  it.each([
    ['a visitor', null],
    ['a resident', user('resident')],
  ])('refuses %s and keeps draft mode off', async (_, signedIn) => {
    auth.mockResolvedValue({ user: signedIn })
    const response = await GET(previewRequest())
    expect(response.status).toBe(403)
    expect(draft.disable).toHaveBeenCalled()
    expect(draft.enable).not.toHaveBeenCalled()
  })

  it.each([
    ['an editor', user('editor')],
    ['an admin', user('admin')],
  ])('turns on draft mode for %s and opens the page', async (_, signedIn) => {
    auth.mockResolvedValue({ user: signedIn })
    await GET(previewRequest())
    expect(draft.enable).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/posts/hello')
  })

  it('refuses a wrong preview secret before checking who is signed in', async () => {
    vi.stubEnv('PREVIEW_SECRET', 'other')
    const response = await GET(previewRequest())
    expect(response.status).toBe(403)
    expect(auth).not.toHaveBeenCalled()
  })
})
