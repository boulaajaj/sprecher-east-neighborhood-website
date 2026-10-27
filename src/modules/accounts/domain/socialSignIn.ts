// Sign in with Google or Facebook (#188, decision 0016): the providers, when each is on, and the
// rule for what a provider's answer may do to an account. Pure: no Payload, no Next.js.

/** The providers the site can sign in with. Apple and X stay off (#312: they cost money). */
export const SOCIAL_PROVIDERS = ['google', 'facebook'] as const

export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number]

/** Set in the context of every create from a provider: the users collection then forces the
 * resident role (`residentOnlyFromProviders`). */
export const SOCIAL_SIGN_IN_CONTEXT = 'socialSignIn'

/** The provider's name as residents read it on the buttons. */
export const SOCIAL_PROVIDER_NAMES: Record<SocialProvider, string> = {
  google: 'Google',
  facebook: 'Facebook',
}

/** The account field that holds each provider's subject: the identity, never the email. */
export const SOCIAL_SUBJECT_FIELDS = {
  google: 'googleSub',
  facebook: 'facebookSub',
} as const satisfies Record<SocialProvider, string>

/** The `.env.local` keys each provider needs. A provider is on only when both are set. */
const PROVIDER_KEYS: Record<SocialProvider, { id: string; secret: string }> = {
  google: { id: 'GOOGLE_CLIENT_ID', secret: 'GOOGLE_CLIENT_SECRET' },
  facebook: { id: 'FACEBOOK_APP_ID', secret: 'FACEBOOK_APP_SECRET' },
}

/** A provider's app keys, read from the environment. */
export type ProviderKeys = { clientId: string; clientSecret: string }

/** The keys of one provider, or null when it's off (either key missing or blank). */
export function providerKeys(
  provider: SocialProvider,
  env: Record<string, string | undefined>,
): ProviderKeys | null {
  const names = PROVIDER_KEYS[provider]
  const clientId = env[names.id]?.trim()
  const clientSecret = env[names.secret]?.trim()
  return clientId && clientSecret ? { clientId, clientSecret } : null
}

/** The providers that are on, in the order the buttons show them. */
export function enabledProviders(env: Record<string, string | undefined>): SocialProvider[] {
  return SOCIAL_PROVIDERS.filter((provider) => providerKeys(provider, env) !== null)
}

/** A provider named in a URL, or null when it isn't one the site knows. */
export function parseSocialProvider(value: unknown): SocialProvider | null {
  return SOCIAL_PROVIDERS.find((provider) => provider === value) ?? null
}

/** The query parameter `/login` reads to show how a provider sign-in ended. */
export const SOCIAL_RESULT_PARAM = 'social'

/** Where a provider sends the person back, on this site's own address. */
export const socialCallbackPath = (provider: SocialProvider) => `/auth/${provider}/callback`

/** Where a sign-in with a provider starts. */
export const socialStartPath = (provider: SocialProvider) => `/auth/${provider}`

/** What a provider said about the person, once its answer was checked. */
export type SocialProfile = {
  provider: SocialProvider
  subject: string
  /** Lowercase, or null when the provider gave none */
  email: string | null
  /** Only Google says so; Facebook's email counts as unverified */
  emailVerified: boolean
  name: string | null
}

/** An account the rule may act on, as much of it as the rule needs. */
export type SocialAccount = {
  id: number
  role: string
  verified: boolean
  lockedUntil: Date | null
}

/**
 * Why a sign-in with a provider didn't open an account. Fixed codes only: the page shows a fixed
 * message for each, never the provider's error.
 */
export type SocialSignInFailure =
  | 'failed'
  | 'no-email'
  | 'email-in-use'
  | 'unavailable'
  | 'too-many'

/** What to do with a provider's answer. */
export type SocialDecision =
  /** A returning person, found by the provider's subject */
  | { kind: 'sign-in'; accountId: number }
  /** Google, a verified email no account uses: a new resident account, already verified */
  | { kind: 'create-verified' }
  /** Facebook, an email no account uses: an unverified account and the usual confirmation link */
  | { kind: 'create-unconfirmed' }
  /** Facebook, an unverified account uses the email: its link goes out again */
  | { kind: 'resend-link'; accountId: number }
  /** Facebook, a verified account uses the email: answered like a new one, nothing is sent */
  | { kind: 'check-email' }
  | { kind: 'refuse'; failure: SocialSignInFailure }

/** Roles a provider may sign in to. An agent's only credential is its MCP key (#336). */
const SIGN_IN_ROLES = new Set(['admin', 'editor', 'resident'])

/**
 * The rule for a provider's answer (decision 0016):
 * - The identity is the provider plus its subject. A returning person is found by it, and
 *   nothing on the account changes.
 * - An account is never linked by its email. For Google, whose email is verified, an email an
 *   account already uses is refused. For Facebook, whose email isn't, the answer can't say
 *   whether an account uses it, so the person reads "check your email" either way.
 * - A Facebook account is created unverified, and opened only by its confirmation link.
 * - A locked account, an unverified one, or an agent can't be signed in to.
 */
export function decideSocialSignIn({
  profile,
  bySubject,
  byEmail,
  now,
}: {
  profile: SocialProfile
  bySubject: SocialAccount | null
  byEmail: SocialAccount | null
  now: Date
}): SocialDecision {
  if (bySubject) {
    const locked = bySubject.lockedUntil !== null && bySubject.lockedUntil > now
    if (locked || !bySubject.verified || !SIGN_IN_ROLES.has(bySubject.role)) {
      return { kind: 'refuse', failure: 'unavailable' }
    }
    return { kind: 'sign-in', accountId: bySubject.id }
  }
  if (!profile.email) return { kind: 'refuse', failure: 'no-email' }

  if (profile.provider === 'google') {
    if (!profile.emailVerified) return { kind: 'refuse', failure: 'failed' }
    return byEmail ? { kind: 'refuse', failure: 'email-in-use' } : { kind: 'create-verified' }
  }
  if (!byEmail) return { kind: 'create-unconfirmed' }
  return byEmail.verified ? { kind: 'check-email' } : { kind: 'resend-link', accountId: byEmail.id }
}

/** A name a provider gave, trimmed and kept to the length a form allows, or null. */
export function toAccountName(name: string | null | undefined): string | null {
  const trimmed = name?.trim()
  return trimmed ? trimmed.slice(0, 100) : null
}
