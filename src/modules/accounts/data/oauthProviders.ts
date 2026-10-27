import 'server-only'

import { createHmac } from 'node:crypto'

import * as client from 'openid-client'

import type { SocialFlow } from '../domain/socialCookies'
import { providerKeys, type SocialProfile, type SocialProvider } from '../domain/socialSignIn'

// The protocol part of a sign-in with Google or Facebook (#188, decision 0016), through
// `openid-client`: the authorization URL, then the callback's checks (`state`; for Google also
// PKCE, the `nonce` and the ID token) and the person's profile. Nothing here touches an account.

/** Facebook's Graph API version (v26, July 2026). Its dialog and token endpoints carry it. */
const FACEBOOK_GRAPH = 'https://graph.facebook.com/v26.0'
const FACEBOOK_DIALOG = 'https://www.facebook.com/v26.0/dialog/oauth'

/** How long a call to a provider may take. */
const PROVIDER_TIMEOUT_S = 10

// Google's settings come from its discovery document, fetched once per process. A failed fetch
// isn't kept, so the next sign-in tries again.
let googleConfig: Promise<client.Configuration> | null = null

async function configFor(provider: SocialProvider): Promise<client.Configuration> {
  const keys = providerKeys(provider, process.env)
  if (!keys) throw new Error(`${provider} sign-in is off`)
  if (provider === 'google') {
    googleConfig ??= client
      .discovery(new URL('https://accounts.google.com'), keys.clientId, keys.clientSecret, undefined, {
        timeout: PROVIDER_TIMEOUT_S,
      })
      .catch((error: unknown) => {
        googleConfig = null
        throw error
      })
    return googleConfig
  }
  // Facebook Login is OAuth 2, not OpenID Connect: its endpoints are listed here, and it takes
  // the app secret in the token request's body
  const config = new client.Configuration(
    {
      issuer: 'https://www.facebook.com',
      authorization_endpoint: FACEBOOK_DIALOG,
      token_endpoint: `${FACEBOOK_GRAPH}/oauth/access_token`,
    },
    keys.clientId,
    keys.clientSecret,
    client.ClientSecretPost(keys.clientSecret),
  )
  config.timeout = PROVIDER_TIMEOUT_S
  return config
}

/** The values a new sign-in checks on its way back, kept in the flow cookie. */
export function newSocialFlow(provider: SocialProvider): SocialFlow {
  return {
    provider,
    state: client.randomState(),
    codeVerifier: client.randomPKCECodeVerifier(),
    nonce: client.randomNonce(),
  }
}

/** Where to send the person to sign in with the provider. */
export async function authorizationUrl(flow: SocialFlow, redirectUri: string): Promise<URL> {
  const config = await configFor(flow.provider)
  if (flow.provider === 'google') {
    return client.buildAuthorizationUrl(config, {
      redirect_uri: redirectUri,
      scope: 'openid email profile',
      state: flow.state,
      nonce: flow.nonce,
      code_challenge: await client.calculatePKCECodeChallenge(flow.codeVerifier),
      code_challenge_method: 'S256',
      // Let the person pick an account each time, rather than signing in silently
      prompt: 'select_account',
    })
  }
  return client.buildAuthorizationUrl(config, {
    redirect_uri: redirectUri,
    scope: 'public_profile,email',
    state: flow.state,
  })
}

/**
 * Finishes the sign-in from the provider's answer at `callbackUrl` (this site's own address, with
 * the answer's query string): checks it against the flow, trades the code for tokens and reads
 * the profile. Throws when any check fails or the provider doesn't answer.
 */
export async function finishAuthorization(
  flow: SocialFlow,
  callbackUrl: URL,
): Promise<SocialProfile> {
  const config = await configFor(flow.provider)
  if (flow.provider === 'google') {
    const tokens = await client.authorizationCodeGrant(config, callbackUrl, {
      expectedState: flow.state,
      expectedNonce: flow.nonce,
      pkceCodeVerifier: flow.codeVerifier,
      idTokenExpected: true,
    })
    const claims = tokens.claims()
    if (!claims) throw new Error('Google sent no ID token')
    return {
      provider: 'google',
      subject: claims.sub,
      email: typeof claims.email === 'string' ? claims.email.trim().toLowerCase() : null,
      emailVerified: claims.email_verified === true,
      name: typeof claims.name === 'string' ? claims.name : null,
    }
  }
  const tokens = await client.authorizationCodeGrant(config, callbackUrl, {
    expectedState: flow.state,
  })
  return readFacebookProfile(tokens.access_token)
}

/** The person's Facebook id, name and email, read with their access token. */
async function readFacebookProfile(accessToken: string): Promise<SocialProfile> {
  const keys = providerKeys('facebook', process.env)
  if (!keys) throw new Error('facebook sign-in is off')
  const url = new URL(`${FACEBOOK_GRAPH}/me`)
  url.searchParams.set('fields', 'id,name,email')
  // Meta's recommended proof that the call comes from the app's server, not a stolen token
  url.searchParams.set(
    'appsecret_proof',
    createHmac('sha256', keys.clientSecret).update(accessToken).digest('hex'),
  )
  const response = await fetch(url, {
    headers: { authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_S * 1000),
  })
  if (!response.ok) throw new Error(`Facebook profile request failed (${response.status})`)
  const body: unknown = await response.json()
  const profile = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {}
  if (typeof profile.id !== 'string' || !profile.id) throw new Error('Facebook sent no id')
  return {
    provider: 'facebook',
    subject: profile.id,
    email: typeof profile.email === 'string' ? profile.email.trim().toLowerCase() : null,
    // Facebook doesn't say whether the email was confirmed, so it counts as unconfirmed
    emailVerified: false,
    name: typeof profile.name === 'string' ? profile.name : null,
  }
}
