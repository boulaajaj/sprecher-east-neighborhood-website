import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { hashConfirmationToken } from '../domain/token'
import { fakeRequest } from '../testing/fakeRequest'

/** The limits keep per-process counters, so every test loads a fresh copy. */
async function load() {
  vi.resetModules()
  return (await import('./requestConfirmation')).requestConfirmation
}

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const NOW = Date.parse('2026-10-22T12:00:00.000Z')

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
  vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://sprechereast.com')
})

afterEach(() => {
  vi.useRealTimers()
})

describe('requestConfirmation', () => {
  it('stores only the hash of a new token, then emails the link to that address', async () => {
    const request = await load()
    const { docs, sent, req } = fakeRequest()

    expect(await request(' Ana@Example.com ', req)).toBe('sent')

    expect(sent).toHaveLength(1)
    expect(sent[0]?.to).toBe('ana@example.com')
    const token = /token=([\w-]{43})/.exec(sent[0]?.text ?? '')?.[1] ?? ''
    expect(sent[0]?.text).toContain(`https://sprechereast.com/confirm-email?token=${token}`)
    expect(docs).toEqual([
      expect.objectContaining({
        email: 'ana@example.com',
        tokenHash: hashConfirmationToken(token),
        tokenExpiresAt: new Date(NOW + DAY).toISOString(),
        lastSentAt: new Date(NOW).toISOString(),
        sendCount: 1,
      }),
    ])
    expect(JSON.stringify(docs)).not.toContain(token)
  })

  it('sends nothing to an address that is already confirmed', async () => {
    const request = await load()
    const { docs, sent, req } = fakeRequest()
    docs.push({ id: 1, email: 'ana@example.com', confirmedAt: new Date(NOW - DAY).toISOString() })

    expect(await request('ana@example.com', req)).toBe('already-confirmed')
    expect(sent).toEqual([])
  })

  it('sends nothing for something that is not one address', async () => {
    const request = await load()
    const { docs, sent, req } = fakeRequest()
    expect(await request('a@example.com, b@example.com', req)).toBe('invalid-address')
    expect(sent).toEqual([])
    expect(docs).toEqual([])
  })

  it('replaces the link on a repeat request, so only the newest one works', async () => {
    const request = await load()
    const { docs, sent, req } = fakeRequest()
    await request('ana@example.com', req)
    await request('ana@example.com', req)

    expect(docs).toHaveLength(1)
    expect(docs[0]?.sendCount).toBe(2)
    const latest = /token=([\w-]{43})/.exec(sent[1]?.text ?? '')?.[1] ?? ''
    expect(docs[0]?.tokenHash).toBe(hashConfirmationToken(latest))
  })

  it('sends at most 3 links a day to one address, from any connection', async () => {
    const request = await load()
    const { sent, req } = fakeRequest()
    const other = { ...req, headers: new Headers({ 'x-forwarded-for': '198.51.100.4' }) }
    for (let i = 0; i < 3; i++) await request('ana@example.com', i % 2 ? req : other)

    expect(await request('ana@example.com', other)).toBe('address-limit')
    expect(sent).toHaveLength(3)

    vi.setSystemTime(NOW + DAY)
    expect(await request('ana@example.com', req)).toBe('sent')
  })

  it('sends at most 5 links an hour from one connection', async () => {
    const request = await load()
    const { sent, req } = fakeRequest()
    for (let i = 0; i < 5; i++) await request(`person${i}@example.com`, req)

    expect(await request('person5@example.com', req)).toBe('connection-limit')
    expect(sent).toHaveLength(5)
  })

  it('sends at most 30 links an hour site-wide, even without a client IP', async () => {
    const request = await load()
    const { sent, req } = fakeRequest({ ip: null })
    for (let i = 0; i < 30; i++) await request(`person${i}@example.com`, req)

    expect(await request('person30@example.com', req)).toBe('site-limit')
    expect(sent).toHaveLength(30)
  })

  it('deletes unconfirmed addresses 7 days after their last link, never confirmed ones', async () => {
    const request = await load()
    const { docs, req } = fakeRequest()
    const old = new Date(NOW - 7 * DAY - 1).toISOString()
    const recent = new Date(NOW - 7 * DAY + 1).toISOString()
    docs.push(
      { id: 1, email: 'stale@example.com', confirmedAt: null, lastSentAt: old },
      { id: 2, email: 'recent@example.com', confirmedAt: null, lastSentAt: recent },
      { id: 3, email: 'kept@example.com', confirmedAt: old, lastSentAt: old },
    )

    await request('ana@example.com', req)

    expect(docs.map((doc) => doc.email)).toEqual([
      'recent@example.com',
      'kept@example.com',
      'ana@example.com',
    ])
  })
})
