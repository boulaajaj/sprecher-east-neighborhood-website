/**
 * Cloudflare Turnstile server-side verification (spam protection for public forms).
 * Server-only: reads TURNSTILE_SECRET_KEY, which must never reach the browser.
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/** Turnstile tokens are at most 2048 characters. */
const MAX_TOKEN_LENGTH = 2048

export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY)
}

type SiteverifyResponse = {
  success: boolean
  'error-codes'?: string[]
  hostname?: string
  action?: string
}

/**
 * Verifies a Turnstile token. Returns false on any failure, including a network error
 * reaching Cloudflare: a public form should fail closed rather than accept unverified posts.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret || !token || token.length > MAX_TOKEN_LENGTH) return false

  const body = new URLSearchParams({ secret, response: token })
  if (remoteIp) body.set('remoteip', remoteIp)

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return false
    const result = (await res.json()) as SiteverifyResponse
    return result.success === true
  } catch {
    return false
  }
}

/** First address in X-Forwarded-For (set by Caddy), else X-Real-IP. */
export function clientIpFromHeaders(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || null
  return headers.get('x-real-ip')
}
