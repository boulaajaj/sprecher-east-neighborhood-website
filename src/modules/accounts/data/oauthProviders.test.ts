import { createHmac } from 'node:crypto'

import type * as OpenIdClient from 'openid-client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

// openid-client is replaced: these tests check what this site asks of it and does with its
// answers. Its own checks (state, nonce, PKCE, the ID token) are its tests' job.
const oidc = vi.hoisted(() => ({
  discovery: vi.fn(),
  buildAuthorizationUrl: vi.fn(),
  authorizationCodeGrant: vi.fn(),
  calculatePKCECodeChallenge: vi.fn(),
}))
vi.mock('openid-client', async (importActual) => {
  const actual = await importActual<typeof OpenIdClient>()
  return {
    ...actual,
    discovery: oidc.discovery,
    buildAuthorizationUrl: oidc.buildAuthorizationUrl,
    authorizationCodeGrant: oidc.authorizationCodeGrant,
    calculatePKCECodeChallenge: oidc.calculatePKCECodeChallenge,
  }
})

const { authorizationUrl, finishAuthorization, newSocialFlow } = await import('./oauthProviders')

const googleFlow = { provider: 'google' as const, state: 's', codeVerifier: 'v', nonce: 'n' }
const facebookFlow = { ...googleFlow, provider: 'facebook' as const }
const callback = new URL('https://sprechereast.com/auth/google/callback?code=c&state=s')
const fetchMock = vi.fn()

beforeEach(() => {
  for (const fn of Object.values(oidc)) fn.mockReset()
  vi.stubEnv('GOOGLE_CLIENT_ID', 'google-id')
  vi.stubEnv('GOOGLE_CLIENT_SECRET', 'google-secret')
  vi.stubEnv('FACEBOOK_APP_ID', 'facebook-id')
  vi.stubEnv('FACEBOOK_APP_SECRET', 'facebook-secret')
  oidc.discovery.mockResolvedValue({ google: true })
  oidc.buildAuthorizationUrl.mockReturnValue(new URL('https://provider.example/auth'))
  oidc.calculatePKCECodeChallenge.mockResolvedValue('challenge')
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

describe('newSocialFlow', () => {
  it('makes a fresh state, PKCE verifier and nonce each time', () => {
    const a = newSocialFlow('google')
    const b = newSocialFlow('google')
    expect(a.provider).toBe('google')
    expect(a.state).not.toBe(b.state)
    expect(a.codeVerifier).not.toBe(b.codeVerifier)
    expect(a.nonce).not.toBe(b.nonce)
  })
})

describe('authorizationUrl', () => {
  it('asks Google for the person’s email with state, nonce and PKCE', async () => {
    await authorizationUrl(googleFlow, 'https://sprechereast.com/auth/google/callback')
    expect(oidc.buildAuthorizationUrl).toHaveBeenCalledWith(
      { google: true },
      expect.objectContaining({
        redirect_uri: 'https://sprechereast.com/auth/google/callback',
        scope: 'openid email profile',
        state: 's',
        nonce: 'n',
        code_challenge: 'challenge',
        code_challenge_method: 'S256',
      }),
    )
  })

  it('asks Facebook for the profile and email with a state', async () => {
    await authorizationUrl(facebookFlow, 'https://sprechereast.com/auth/facebook/callback')
    const [config, params] = oidc.buildAuthorizationUrl.mock.calls[0] ?? []
    expect(config.serverMetadata().authorization_endpoint).toBe(
      'https://www.facebook.com/v26.0/dialog/oauth',
    )
    expect(params).toEqual({
      redirect_uri: 'https://sprechereast.com/auth/facebook/callback',
      scope: 'public_profile,email',
      state: 's',
    })
  })
})

describe('finishAuthorization', () => {
  it('checks Google’s answer against the flow and reads the ID token', async () => {
    oidc.authorizationCodeGrant.mockResolvedValue({
      claims: () => ({ sub: 'g-1', email: ' Ana@Example.com ', email_verified: true, name: 'Ana' }),
    })
    expect(await finishAuthorization(googleFlow, callback)).toEqual({
      provider: 'google',
      subject: 'g-1',
      email: 'ana@example.com',
      emailVerified: true,
      name: 'Ana',
    })
    expect(oidc.authorizationCodeGrant).toHaveBeenCalledWith({ google: true }, callback, {
      expectedState: 's',
      expectedNonce: 'n',
      pkceCodeVerifier: 'v',
      idTokenExpected: true,
    })
  })

  it('counts a Google email as verified only when Google says exactly true', async () => {
    oidc.authorizationCodeGrant.mockResolvedValue({
      claims: () => ({ sub: 'g-1', email: 'a@example.com', email_verified: 'true' }),
    })
    expect((await finishAuthorization(googleFlow, callback)).emailVerified).toBe(false)
  })

  it('throws when Google sends no ID token', async () => {
    oidc.authorizationCodeGrant.mockResolvedValue({ claims: () => undefined })
    await expect(finishAuthorization(googleFlow, callback)).rejects.toThrow('no ID token')
  })

  it('reads the Facebook profile with the app secret proof, and counts its email as unverified', async () => {
    oidc.authorizationCodeGrant.mockResolvedValue({ access_token: 'token-1' })
    fetchMock.mockResolvedValue(
      Response.json({ id: 'f-1', name: 'Ana', email: 'Ana@Example.com' }),
    )
    expect(await finishAuthorization(facebookFlow, callback)).toEqual({
      provider: 'facebook',
      subject: 'f-1',
      email: 'ana@example.com',
      emailVerified: false,
      name: 'Ana',
    })
    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(url.origin + url.pathname).toBe('https://graph.facebook.com/v26.0/me')
    expect(url.searchParams.get('appsecret_proof')).toBe(
      createHmac('sha256', 'facebook-secret').update('token-1').digest('hex'),
    )
    expect(init.headers).toEqual({ authorization: 'Bearer token-1' })
    expect(oidc.authorizationCodeGrant.mock.calls[0]?.[2]).toEqual({ expectedState: 's' })
  })

  it('throws when Facebook refuses the profile or sends no id', async () => {
    oidc.authorizationCodeGrant.mockResolvedValue({ access_token: 'token-1' })
    fetchMock.mockResolvedValue(new Response('{}', { status: 400 }))
    await expect(finishAuthorization(facebookFlow, callback)).rejects.toThrow('(400)')
    fetchMock.mockResolvedValue(Response.json({ name: 'Ana' }))
    await expect(finishAuthorization(facebookFlow, callback)).rejects.toThrow('no id')
  })

  it('throws when the provider is off', async () => {
    vi.stubEnv('FACEBOOK_APP_SECRET', '')
    await expect(finishAuthorization(facebookFlow, callback)).rejects.toThrow('off')
  })
})
