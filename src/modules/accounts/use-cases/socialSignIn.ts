import 'server-only'

import { getServerSideURL } from '@/platform/lib/getURL'

import { authorizationUrl, finishAuthorization, newSocialFlow } from '../data/oauthProviders'
import {
  createUnconfirmedAccount,
  createVerifiedAccount,
  findAccountByEmail,
  findAccountBySubject,
  linkSubject,
  savePendingLink,
  saveSocialFlow,
  startSessionFor,
  takePendingLink,
  takeSocialFlow,
} from '../data/socialAccounts'
import { deleteFailedSignUp, resendVerification } from '../data/signUp'
import { ACCOUNT_PATH, SIGN_IN_PATH } from '../domain/paths'
import { SIGN_UP_LIMITS } from '../domain/requestLimits'
import { linkBelongsTo } from '../domain/socialCookies'
import {
  decideSocialSignIn,
  enabledProviders,
  providerKeys,
  SOCIAL_RESULT_PARAM,
  socialCallbackPath,
  type SocialProfile,
  type SocialProvider,
  type SocialSignInFailure,
} from '../domain/socialSignIn'
import { createRequestGuard } from './guardPublicRequest'
import { logServerFailure } from './logServerFailure'

// Sign in with Google or Facebook (#188, decision 0016). The routes in src/app/(frontend)/auth/
// call these two, and redirect wherever they answer.

/** What `/login` shows after a provider sign-in that didn't open an account. */
type SocialSignInResult = SocialSignInFailure | 'check-email'

const toLogin = (result: SocialSignInResult) => `${SIGN_IN_PATH}?${SOCIAL_RESULT_PARAM}=${result}`

// A new account from a provider counts against the same limits as an email sign-up: each one
// stores an account, and a Facebook one sends an email. No robot check: the provider's own sign-in
// stands in for it.
const newAccountGuard = createRequestGuard('Provider sign-up', SIGN_UP_LIMITS)
const NO_ROBOT_CHECK = {
  isEnabled: () => false,
  verify: async () => ({ ok: true as const }),
}

/** The providers whose keys are set: the log-in and sign-up pages show a button for each. */
export function getEnabledSocialProviders(): SocialProvider[] {
  return enabledProviders(process.env)
}

/**
 * Starts a sign-in: keeps its checks in this browser and answers where to send the person.
 * Answers `/login` with a fixed message when the provider is off or can't be reached.
 */
export async function startSocialSignIn(provider: SocialProvider): Promise<string> {
  if (!providerKeys(provider, process.env)) return toLogin('failed')
  try {
    const flow = newSocialFlow(provider)
    const url = await authorizationUrl(flow, redirectUri(provider))
    await saveSocialFlow(flow, new Date())
    return url.href
  } catch (error) {
    logServerFailure(`${provider} sign-in start`, error)
    return toLogin('failed')
  }
}

/**
 * Finishes a sign-in from the provider's answer (`search`: the callback's query string). Checks
 * it against the flow this browser started, then follows the sign-in rule
 * (`decideSocialSignIn`). Answers where to send the person: their account when they're signed in,
 * otherwise `/login` with a fixed message. The provider's own errors are logged, never shown.
 */
export async function finishSocialSignIn(
  provider: SocialProvider,
  search: string,
  ip: string | null,
): Promise<string> {
  const now = new Date()
  const flow = await takeSocialFlow(now)
  // No flow, or one for another provider: this browser didn't start this sign-in
  if (!flow || flow.provider !== provider) return toLogin('failed')

  let profile: SocialProfile
  try {
    const callbackUrl = new URL(`${socialCallbackPath(provider)}${search}`, getServerSideURL())
    profile = await finishAuthorization(flow, callbackUrl)
  } catch (error) {
    // Includes the person pressing Cancel at the provider: an `error` answer fails the checks
    logServerFailure(`${provider} sign-in`, error)
    return toLogin('failed')
  }

  try {
    const decision = decideSocialSignIn({
      profile,
      bySubject: await findAccountBySubject(provider, profile.subject),
      byEmail: profile.email ? await findAccountByEmail(profile.email) : null,
      now,
    })
    switch (decision.kind) {
      case 'sign-in':
        await startSessionFor(decision.accountId)
        return ACCOUNT_PATH
      case 'refuse':
        return toLogin(decision.failure)
      case 'check-email':
        return toLogin('check-email')
      case 'create-verified': {
        if (await newAccountGuard({ token: null, ip }, NO_ROBOT_CHECK)) return toLogin('too-many')
        await startSessionFor(await createVerifiedAccount(profile))
        return ACCOUNT_PATH
      }
      case 'create-unconfirmed':
        if (await newAccountGuard({ token: null, ip }, NO_ROBOT_CHECK)) return toLogin('too-many')
        await createUnconfirmed(profile, now)
        return toLogin('check-email')
      case 'resend-link': {
        if (await newAccountGuard({ token: null, ip }, NO_ROBOT_CHECK)) return toLogin('too-many')
        // The same resend an email sign-up gets (#289): capped, and the link asks for a password
        if ((await resendVerification(profile.email ?? '', now)) === 'sent') {
          await rememberLink(profile, decision.accountId, now)
        }
        return toLogin('check-email')
      }
    }
  } catch (error) {
    logServerFailure(`${provider} sign-in account`, error)
    return toLogin('failed')
  }
}

/**
 * A Facebook sign-in for a new address: an unverified account and Payload's verification email,
 * then, in this browser only, the Facebook account to link once the link is opened. As for the
 * email sign-up, an account whose email failed to send is removed, so the address isn't stuck.
 */
async function createUnconfirmed(profile: SocialProfile, now: Date): Promise<void> {
  let accountId: number
  try {
    accountId = await createUnconfirmedAccount(profile)
  } catch (error) {
    if (profile.email) {
      await deleteFailedSignUp(profile.email, now).catch((cleanupError: unknown) =>
        logServerFailure('Provider sign-up cleanup', cleanupError),
      )
    }
    throw error
  }
  await rememberLink(profile, accountId, now)
}

async function rememberLink(profile: SocialProfile, accountId: number, now: Date) {
  if (!profile.email) return
  await savePendingLink(
    { provider: profile.provider, subject: profile.subject, accountId, email: profile.email },
    now,
  )
}

/**
 * Once a verification link opened an account, links the provider account this browser signed in
 * with, if it was waiting for exactly this account and email (#188). Anything else links nothing.
 * The account is verified either way; a link that fails is logged.
 */
export async function linkWaitingSocialAccount(account: {
  id: number
  email: string
}): Promise<void> {
  try {
    const link = await takePendingLink(new Date())
    if (link && linkBelongsTo(link, account)) {
      await linkSubject(account.id, link.provider, link.subject)
    }
  } catch (error) {
    logServerFailure('Linking a provider account', error)
  }
}

const redirectUri = (provider: SocialProvider) =>
  new URL(socialCallbackPath(provider), getServerSideURL()).href
