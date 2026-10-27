// The two cookies a sign-in with a provider uses (#188, decision 0016), and what each may hold.
// Both are signed (`signedValue.ts`), HttpOnly, SameSite=Lax and Secure in production.

import { parseSocialProvider, type SocialProvider } from './socialSignIn'

/**
 * The flow cookie: what the start of a sign-in made (`state`, a PKCE verifier, a `nonce`), read
 * back by the callback in the same browser and then cleared. Path `/auth`, ten minutes.
 */
export const SOCIAL_FLOW_COOKIE = 'sprecher-east-social-flow'
export const SOCIAL_FLOW_PATH = '/auth'
export const SOCIAL_FLOW_TTL_MS = 10 * 60 * 1000

export type SocialFlow = {
  provider: SocialProvider
  state: string
  codeVerifier: string
  nonce: string
}

/** A signed flow cookie's data as a flow, or null when it isn't one. */
export function toSocialFlow(data: Record<string, unknown> | null): SocialFlow | null {
  if (!data) return null
  const provider = parseSocialProvider(data.provider)
  const { state, codeVerifier, nonce } = data
  if (!provider || typeof state !== 'string' || typeof codeVerifier !== 'string') return null
  if (typeof nonce !== 'string') return null
  return { provider, state, codeVerifier, nonce }
}

/**
 * The link cookie: a Facebook sign-in for an address no verified account uses sends the usual
 * confirmation link, and this cookie remembers, in that browser only, which Facebook account to
 * link once the link is opened. It's bound to the account and the email the link went to, so a
 * link opened in another browser, or another person's link opened in this one, links nothing.
 * It lasts no longer than a sign-up link is meant to (24 hours). Path `/`, because the link is
 * confirmed from `/verify-account`.
 */
export const SOCIAL_LINK_COOKIE = 'sprecher-east-social-link'
export const SOCIAL_LINK_TTL_MS = 24 * 60 * 60 * 1000

export type PendingSocialLink = {
  provider: SocialProvider
  subject: string
  accountId: number
  email: string
}

/** A signed link cookie's data as a pending link, or null when it isn't one. */
export function toPendingSocialLink(
  data: Record<string, unknown> | null,
): PendingSocialLink | null {
  if (!data) return null
  const provider = parseSocialProvider(data.provider)
  const { subject, accountId, email } = data
  if (!provider || typeof subject !== 'string' || !subject) return null
  if (typeof accountId !== 'number' || typeof email !== 'string') return null
  return { provider, subject, accountId, email }
}

/** Whether a pending link belongs to the account a verification link just opened. */
export function linkBelongsTo(
  link: PendingSocialLink,
  account: { id: number; email: string },
): boolean {
  return link.accountId === account.id && link.email === account.email.toLowerCase()
}
