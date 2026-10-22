import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TURNSTILE_ACTION } from '../domain/turnstile'

const REAL_SECRET = '0x4AAAAAAAexampleexampleexampleexample'
const PASS_SECRET = '1x0000000000000000000000000000000AA' // Cloudflare test secret: always passes

/** Fresh module per test: isEnabled() remembers that it has already warned. */
async function loadTurnstile() {
  vi.resetModules()
  const { TurnstileVerifier, listAllowedHostnames } = await import('./turnstileVerifier')
  const verifier = new TurnstileVerifier()
  return {
    verify: (token: string | null | undefined) => verifier.verify(token),
    isEnabled: () => verifier.isEnabled(),
    listAllowedHostnames,
  }
}

/** Stubs Cloudflare's Siteverify endpoint with one JSON response and returns the mock. */
function stubSiteverify(body: unknown, init: { status?: number } = {}) {
  const fetchMock = vi.fn(async () => Response.json(body, { status: init.status ?? 200 }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const goodResponse = { success: true, action: TURNSTILE_ACTION, hostname: 'sprechereast.example' }

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://sprechereast.example')
  vi.stubEnv('TURNSTILE_ALLOWED_HOSTNAMES', '')
  vi.stubEnv('TURNSTILE_SECRET_KEY', REAL_SECRET)
})

describe('TurnstileVerifier.verify: inputs', () => {
  it('fails without a secret, and never calls Cloudflare', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')
    const fetchMock = stubSiteverify(goodResponse)
    const { verify } = await loadTurnstile()
    expect(await verify('token')).toEqual({ ok: false, reason: 'no-secret' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('fails without a token', async () => {
    const { verify } = await loadTurnstile()
    expect(await verify(undefined)).toEqual({ ok: false, reason: 'missing-token' })
    expect(await verify('')).toEqual({ ok: false, reason: 'missing-token' })
  })

  it('rejects a token longer than 2048 characters without calling Cloudflare', async () => {
    const fetchMock = stubSiteverify(goodResponse)
    const { verify } = await loadTurnstile()
    expect(await verify('x'.repeat(2049))).toEqual({
      ok: false,
      reason: 'token-too-long',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sends the secret and token, and no client IP', async () => {
    const fetchMock = stubSiteverify(goodResponse)
    const { verify } = await loadTurnstile()
    await verify('the-token')
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify')
    const sent = init.body as URLSearchParams
    expect(sent.get('secret')).toBe(REAL_SECRET)
    expect(sent.get('response')).toBe('the-token')
    expect(sent.has('remoteip')).toBe(false)
    // A hung Cloudflare call must not hold the submission open indefinitely
    expect(init.signal).toBeInstanceOf(AbortSignal)
  })
})

describe('TurnstileVerifier.verify: Cloudflare answers', () => {
  it('passes a successful token with our action and hostname', async () => {
    stubSiteverify(goodResponse)
    const { verify } = await loadTurnstile()
    expect(await verify('t')).toEqual({ ok: true })
  })

  it('compares hostnames case-insensitively', async () => {
    stubSiteverify({ ...goodResponse, hostname: 'SprecherEast.Example' })
    const { verify } = await loadTurnstile()
    expect(await verify('t')).toEqual({ ok: true })
  })

  it('reports Cloudflare error codes on failure (e.g. a reused or expired token)', async () => {
    stubSiteverify({ success: false, 'error-codes': ['timeout-or-duplicate'] })
    const { verify } = await loadTurnstile()
    expect(await verify('t')).toEqual({
      ok: false,
      reason: 'timeout-or-duplicate',
    })
  })

  it('fails on a missing or different action', async () => {
    stubSiteverify({ ...goodResponse, action: undefined })
    let { verify } = await loadTurnstile()
    expect(await verify('t')).toEqual({
      ok: false,
      reason: 'unexpected-action:none',
    })

    stubSiteverify({ ...goodResponse, action: 'login' })
    ;({ verify } = await loadTurnstile())
    expect(await verify('t')).toEqual({
      ok: false,
      reason: 'unexpected-action:login',
    })
  })

  it('fails on a missing hostname or one not on the allowlist, including look-alikes', async () => {
    for (const [hostname, reason] of [
      [undefined, 'unexpected-hostname:none'],
      ['evil.example', 'unexpected-hostname:evil.example'],
      ['sprechereast.example.evil.test', 'unexpected-hostname:sprechereast.example.evil.test'],
      ['www.sprechereast.example', 'unexpected-hostname:www.sprechereast.example'],
    ] as const) {
      stubSiteverify({ ...goodResponse, hostname })
      const { verify } = await loadTurnstile()
      expect(await verify('t')).toEqual({ ok: false, reason })
    }
  })

  it('accepts hostnames listed in TURNSTILE_ALLOWED_HOSTNAMES, as names or URLs', async () => {
    vi.stubEnv(
      'TURNSTILE_ALLOWED_HOSTNAMES',
      ' www.sprechereast.example , https://staging.sprechereast.example/ ,',
    )
    for (const hostname of ['www.sprechereast.example', 'staging.sprechereast.example']) {
      stubSiteverify({ ...goodResponse, hostname })
      const { verify } = await loadTurnstile()
      expect(await verify('t')).toEqual({ ok: true })
    }
  })

  it('skips the action and hostname checks for Cloudflare test secrets', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', PASS_SECRET)
    stubSiteverify({ success: true })
    const { verify } = await loadTurnstile()
    expect(await verify('t')).toEqual({ ok: true })
  })
})

describe('TurnstileVerifier.verify: fails closed', () => {
  it('on an HTTP error from Cloudflare', async () => {
    stubSiteverify({}, { status: 503 })
    const { verify } = await loadTurnstile()
    expect(await verify('t')).toEqual({ ok: false, reason: 'siteverify-http-503' })
  })

  it('when Cloudflare cannot be reached or times out', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new DOMException('The operation timed out.', 'TimeoutError')
      }),
    )
    const { verify } = await loadTurnstile()
    expect(await verify('t')).toEqual({
      ok: false,
      reason: 'network-error:TimeoutError',
    })
  })
})

describe('listAllowedHostnames', () => {
  it('contains the site host plus valid listed entries, lower-cased', async () => {
    vi.stubEnv('TURNSTILE_ALLOWED_HOSTNAMES', 'Alias.Example:443, not a host, ,https://b.example/x')
    const { listAllowedHostnames } = await loadTurnstile()
    expect([...listAllowedHostnames()].sort()).toEqual([
      'alias.example',
      'b.example',
      'sprechereast.example',
    ])
  })
})

describe('TurnstileVerifier.isEnabled', () => {
  it('is on only when both keys are set', async () => {
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '0x4AAAAAAAsitekey')
    const { isEnabled } = await loadTurnstile()
    expect(isEnabled()).toBe(true)
  })

  it('is off with neither key, without logging', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '')
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { isEnabled } = await loadTurnstile()
    expect(isEnabled()).toBe(false)
    expect(error).not.toHaveBeenCalled()
  })

  it('is off with only one key, and logs that once', async () => {
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '')
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { isEnabled } = await loadTurnstile()
    expect(isEnabled()).toBe(false)
    expect(isEnabled()).toBe(false)
    expect(error).toHaveBeenCalledTimes(1)
    expect(error.mock.calls[0]?.[0]).toContain('Spam check is OFF')
  })

  it('warns once when a test secret is used in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('TURNSTILE_SECRET_KEY', PASS_SECRET)
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '1x00000000000000000000AA')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { isEnabled } = await loadTurnstile()
    expect(isEnabled()).toBe(true)
    isEnabled()
    expect(warn).toHaveBeenCalledTimes(1)
  })
})
