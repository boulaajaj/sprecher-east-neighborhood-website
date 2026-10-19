/**
 * Cloudflare Turnstile server-side verification (spam protection for public forms).
 * Server-only: reads TURNSTILE_SECRET_KEY, which must never reach the browser.
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

import { TURNSTILE_ACTION } from './turnstileHeader'

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Cloudflare's published dummy secrets (always pass / always fail / token spent). Their
 * responses don't carry our action, so the action check is skipped for them.
 * https://developers.cloudflare.com/turnstile/troubleshooting/testing/
 */
const DUMMY_SECRETS = new Set([
  '1x0000000000000000000000000000000AA',
  '2x0000000000000000000000000000000AA',
  '3x0000000000000000000000000000000AA',
])

/** Turnstile tokens are at most 2048 characters. */
const MAX_TOKEN_LENGTH = 2048

let warnedHalfConfigured = false

/**
 * On only when BOTH keys are set. The site key is pinned at build time for server and browser
 * code alike (next.config.js `env`), so this sees the same value the browser bundle has:
 * adding keys to .env.local without a rebuild leaves the check off instead of rejecting every
 * visitor who has no widget to solve. (Outside Next, e.g. `payload migrate`, it's read live.)
 */
export function isTurnstileEnabled(): boolean {
  const secret = Boolean(process.env.TURNSTILE_SECRET_KEY)
  const siteKey = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
  if (secret !== siteKey && !warnedHalfConfigured) {
    console.error(
      '[turnstile] Spam check is OFF: set both TURNSTILE_SECRET_KEY and NEXT_PUBLIC_TURNSTILE_SITE_KEY, then rebuild',
    )
    warnedHalfConfigured = true
  }
  return secret && siteKey
}

type SiteverifyResponse = {
  success: boolean
  'error-codes'?: string[]
  hostname?: string
  action?: string
}

export type TurnstileResult = { ok: true } | { ok: false; reason: string }

/**
 * Verifies a Turnstile token. Any failure — including a network error reaching Cloudflare —
 * returns ok: false, so a public form fails closed rather than accepting unverified posts.
 * `reason` is for server logs only (never the token or the secret).
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return { ok: false, reason: 'no-secret' }
  if (!token) return { ok: false, reason: 'missing-token' }
  if (token.length > MAX_TOKEN_LENGTH) return { ok: false, reason: 'token-too-long' }

  const body = new URLSearchParams({ secret, response: token })
  if (remoteIp) body.set('remoteip', remoteIp)

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return { ok: false, reason: `siteverify-http-${res.status}` }
    const result = (await res.json()) as SiteverifyResponse
    if (result.success !== true) {
      return { ok: false, reason: (result['error-codes'] ?? ['unknown']).join(',') }
    }
    // Cloudflare advises checking the action when one is set (not meaningful for dummy keys).
    if (!DUMMY_SECRETS.has(secret) && result.action && result.action !== TURNSTILE_ACTION) {
      return { ok: false, reason: `unexpected-action:${result.action}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, reason: `network-error:${err instanceof Error ? err.name : 'unknown'}` }
  }
}
