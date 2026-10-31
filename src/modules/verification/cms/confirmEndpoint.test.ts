import type { PayloadRequest } from 'payload'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { HumanVerifier } from '@/platform/lib/humanCheck'

import { fakeRequest } from '../testing/fakeRequest'

/** A robot check that is off: most tests are about the link, not the check. */
const checkOff: HumanVerifier = { isEnabled: () => false, verify: async () => ({ ok: true }) }

/** A robot check that is on and passes only the token "human". */
const checkOn: HumanVerifier = {
  isEnabled: () => true,
  verify: async (token) => (token === 'human' ? { ok: true } : { ok: false, reason: 'bad' }),
}

/** The endpoint keeps a per-process counter, so every test loads a fresh copy. */
async function load(verifier: HumanVerifier = checkOff) {
  vi.resetModules()
  return (await import('./confirmEndpoint')).confirmEndpoint([], verifier)
}

/** A POST to the endpoint with this JSON body (or a body that isn't JSON). */
function post(body: unknown, fake = fakeRequest(), robotToken?: string) {
  const json = vi.fn(async () => {
    if (body === 'not json') throw new SyntaxError('Unexpected token')
    return body
  })
  const headers = new Headers(fake.req.headers)
  if (robotToken) headers.set('x-turnstile-token', robotToken)
  return { ...fake.req, headers, json } as unknown as PayloadRequest
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://sprechereast.com')
})

describe('confirmEndpoint', () => {
  it('is POST /confirm on the collection', async () => {
    const endpoint = await load()
    expect([endpoint.method, endpoint.path]).toEqual(['post', '/confirm'])
  })

  it('answers the outcome as JSON, and "invalid" for a missing or unreadable token', async () => {
    const endpoint = await load()
    for (const body of [{ token: 'x' }, {}, null, 'not json']) {
      const response = await endpoint.handler(post(body))
      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ outcome: 'invalid' })
    }
  })

  it('allows 20 tries an hour from one connection, then answers 429', async () => {
    const endpoint = await load()
    for (let i = 0; i < 20; i++) await endpoint.handler(post({ token: 'x' }))
    expect((await endpoint.handler(post({ token: 'x' }))).status).toBe(429)
  })

  it('answers the address with a confirmed outcome, for the page’s next step', async () => {
    vi.resetModules()
    vi.doMock('./confirmEmail', () => ({
      confirmEmail: async () => ({ outcome: 'confirmed', email: 'ana@example.com' }),
    }))
    const endpoint = (await import('./confirmEndpoint')).confirmEndpoint([], checkOff)
    const response = await endpoint.handler(post({ token: 'a'.repeat(43) }))
    expect(await response.json()).toEqual({ outcome: 'confirmed', email: 'ana@example.com' })
    vi.doUnmock('./confirmEmail')
  })

  it('confirms nothing without a robot-check token that passes (#303)', async () => {
    const endpoint = await load(checkOn)
    const fake = fakeRequest()
    for (const robotToken of [undefined, 'bot']) {
      const response = await endpoint.handler(post({ token: 'a'.repeat(43) }, fake, robotToken))
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: 'robot-check' })
    }
    expect(fake.payload.find).not.toHaveBeenCalled()
  })

  it('follows the link once the robot check passes', async () => {
    const endpoint = await load(checkOn)
    const response = await endpoint.handler(post({ token: 'x' }, fakeRequest(), 'human'))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ outcome: 'invalid' })
  })

  it('answers 500 with a fixed message when the database fails', async () => {
    const endpoint = await load()
    const fake = fakeRequest()
    fake.payload.find.mockRejectedValueOnce(new Error('SQLITE_BUSY'))
    const response = await endpoint.handler(post({ token: 'a'.repeat(43) }, fake))
    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Something went wrong.' })
  })
})
