/**
 * Cloudflare Turnstile server-side verification (spam protection for public forms): the
 * production `HumanVerifier`. Server code only: it reads TURNSTILE_SECRET_KEY, which must never
 * reach the browser. It has no `server-only` import because a Payload hook uses it, and the
 * Payload CLI loads hooks outside Next.js.
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

import { getServerSideURL } from '@/utilities/getURL'

import type { HumanCheck, HumanVerifier } from '../domain/humanVerifier'
import { TURNSTILE_ACTION } from '../domain/turnstile'

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Cloudflare's published dummy secrets (always pass / always fail / token spent). Their
 * responses don't carry our action or hostname, so those checks are skipped for them; every
 * other secret gets both checks. https://developers.cloudflare.com/turnstile/troubleshooting/testing/
 */
const DUMMY_SECRETS = new Set([
  '1x0000000000000000000000000000000AA',
  '2x0000000000000000000000000000000AA',
  '3x0000000000000000000000000000000AA',
])

/** Turnstile tokens are at most 2048 characters. */
const MAX_TOKEN_LENGTH = 2048

let warnedHalfConfigured = false
let warnedTestSecret = false

/**
 * On only when BOTH keys are set. The site key is pinned at build time for server and browser
 * code alike (next.config.js `env`), so this sees the same value the browser bundle has:
 * adding keys to .env.local without a rebuild leaves the check off instead of rejecting every
 * visitor who has no widget to solve. (Outside Next, e.g. `payload migrate`, it's read live.)
 */
function isTurnstileEnabled(): boolean {
  const secret = Boolean(process.env.TURNSTILE_SECRET_KEY)
  const siteKey = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
  if (secret !== siteKey && !warnedHalfConfigured) {
    console.error(
      '[turnstile] Spam check is OFF: only one of TURNSTILE_SECRET_KEY and NEXT_PUBLIC_TURNSTILE_SITE_KEY is set. To turn it on, set both and rebuild.',
    )
    warnedHalfConfigured = true
  }
  const enabled = secret && siteKey
  if (
    enabled &&
    process.env.NODE_ENV === 'production' &&
    DUMMY_SECRETS.has(process.env.TURNSTILE_SECRET_KEY ?? '') &&
    !warnedTestSecret
  ) {
    console.warn(
      '[turnstile] TURNSTILE_SECRET_KEY is a Cloudflare test secret, so the result never depends on the visitor (it always passes, or always fails). Use the real keys outside local testing.',
    )
    warnedTestSecret = true
  }
  return enabled
}

/** Accepts "www.example.org", "https://www.example.org/" or "www.example.org:443". */
function toHostname(entry: string): string | null {
  const trimmed = entry.trim()
  if (!trimmed) return null
  try {
    return new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`).hostname.toLowerCase()
  } catch {
    return null
  }
}

/**
 * Hostnames a token may come from: the site's own (NEXT_PUBLIC_SERVER_URL) plus any listed in
 * TURNSTILE_ALLOWED_HOSTNAMES (comma-separated). A token solved on another hostname that uses
 * the same widget (e.g. a dev host) is rejected.
 */
export function listAllowedHostnames(): Set<string> {
  const hosts = new Set<string>()
  try {
    hosts.add(new URL(getServerSideURL()).hostname.toLowerCase())
  } catch {
    // An invalid server URL leaves only the explicit list; with an empty list, every token fails.
  }
  for (const entry of (process.env.TURNSTILE_ALLOWED_HOSTNAMES ?? '').split(',')) {
    const hostname = toHostname(entry)
    if (hostname) hosts.add(hostname)
  }
  return hosts
}

type SiteverifyResponse = {
  success: boolean
  'error-codes'?: string[]
  hostname?: string
  action?: string
}

/**
 * Verifies a Turnstile token. Any failure — including a network error reaching Cloudflare —
 * returns ok: false, so a public form fails closed rather than accepting unverified posts.
 * `reason` is for server logs only (never the token or the secret). Tokens are single use and
 * expire after 5 minutes; Cloudflare enforces both (`timeout-or-duplicate`).
 *
 * No `remoteip` is sent: it's optional, and the only source here would be X-Forwarded-For,
 * which a client can set itself if it ever reaches the app without going through Caddy (#118).
 */
async function verifyTurnstileToken(token: string | null | undefined): Promise<HumanCheck> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return { ok: false, reason: 'no-secret' }
  if (!token) return { ok: false, reason: 'missing-token' }
  if (token.length > MAX_TOKEN_LENGTH) return { ok: false, reason: 'token-too-long' }

  const body = new URLSearchParams({ secret, response: token })

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
    // Cloudflare: "Validate the action and hostname when specified". Our widget always sets the
    // action, so a missing or different one fails too. Dummy secrets don't return either.
    if (!DUMMY_SECRETS.has(secret)) {
      if (result.action !== TURNSTILE_ACTION) {
        return { ok: false, reason: `unexpected-action:${result.action ?? 'none'}` }
      }
      const hostname = result.hostname?.toLowerCase()
      if (!hostname || !listAllowedHostnames().has(hostname)) {
        return { ok: false, reason: `unexpected-hostname:${hostname ?? 'none'}` }
      }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, reason: `network-error:${err instanceof Error ? err.name : 'unknown'}` }
  }
}

/** The robot check through Cloudflare Turnstile. */
export class TurnstileVerifier implements HumanVerifier {
  isEnabled(): boolean {
    return isTurnstileEnabled()
  }

  verify(token: string | null | undefined): Promise<HumanCheck> {
    return verifyTurnstileToken(token)
  }
}
