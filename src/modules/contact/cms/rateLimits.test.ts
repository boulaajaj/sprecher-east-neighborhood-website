import { APIError } from 'payload'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { User } from '@/payload-types'

/** The limits keep per-process counters, so every test loads a fresh copy. */
async function loadGuards() {
  vi.resetModules()
  return import('./rateLimits')
}

type Guards = Awaited<ReturnType<typeof loadGuards>>
type RateLimitArgs = Parameters<Guards['rateLimitSubmissions']>[0]

const HOUR = 60 * 60 * 1000

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-20T12:00:00.000Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('rateLimitSubmissions', () => {
  const submit = (
    guards: Guards,
    { ip = '203.0.113.7', user = null as User | null, operation = 'create' } = {},
  ) =>
    guards.rateLimitSubmissions({
      data: { form: 1 },
      operation,
      req: { user, headers: new Headers(ip ? { 'x-forwarded-for': ip } : {}) },
    } as unknown as RateLimitArgs)

  const expect429 = (fn: () => unknown) => {
    try {
      fn()
    } catch (error) {
      expect(error).toBeInstanceOf(APIError)
      expect((error as APIError).status).toBe(429)
      return
    }
    throw new Error('expected a 429')
  }

  it('allows 5 submissions per hour from one address, then answers 429', async () => {
    const guards = await loadGuards()
    for (let i = 0; i < 5; i++) expect(submit(guards)).toEqual({ form: 1 })
    expect429(() => submit(guards))
  })

  it('counts each address separately', async () => {
    const guards = await loadGuards()
    for (let i = 0; i < 5; i++) submit(guards)
    expect(submit(guards, { ip: '198.51.100.4' })).toEqual({ form: 1 })
  })

  it('lets the address submit again once the hour has passed', async () => {
    const guards = await loadGuards()
    for (let i = 0; i < 5; i++) submit(guards)
    vi.setSystemTime(Date.now() + HOUR)
    expect(submit(guards)).toEqual({ form: 1 })
  })

  it('never limits admins or editors', async () => {
    const guards = await loadGuards()
    const editor = { id: 1, role: 'editor' } as User
    for (let i = 0; i < 10; i++) expect(submit(guards, { user: editor })).toEqual({ form: 1 })
  })

  it('still limits a signed-in resident', async () => {
    const guards = await loadGuards()
    const resident = { id: 2, role: 'resident' } as User
    for (let i = 0; i < 5; i++) submit(guards, { user: resident })
    expect429(() => submit(guards, { user: resident }))
  })

  it('ignores updates and requests without an address', async () => {
    const guards = await loadGuards()
    for (let i = 0; i < 10; i++) {
      expect(submit(guards, { operation: 'update' })).toEqual({ form: 1 })
      expect(submit(guards, { ip: '' })).toEqual({ form: 1 })
    }
  })
})

describe('capFormEmails', () => {
  it('lets 30 form emails an hour through across all submissions, warning once', async () => {
    const guards = await loadGuards()
    const warn = vi.fn()
    let sent = 0
    for (let i = 0; i < 35; i++) sent += guards.capFormEmails(['email'], { warn }).length
    expect(sent).toBe(30)
    expect(warn).toHaveBeenCalledOnce()
    expect(warn).toHaveBeenCalledWith(
      'Form emails hit the site-wide hourly limit; submissions are still stored',
    )

    vi.setSystemTime(Date.now() + HOUR)
    expect(guards.capFormEmails(['email'], { warn })).toEqual(['email'])
  })

  it('keeps the first emails of a submission when only some fit', async () => {
    const guards = await loadGuards()
    const warn = vi.fn()
    guards.capFormEmails(
      Array.from({ length: 29 }, () => 'earlier'),
      { warn },
    )
    expect(guards.capFormEmails(['owner', 'copy'], { warn })).toEqual(['owner'])
  })
})
