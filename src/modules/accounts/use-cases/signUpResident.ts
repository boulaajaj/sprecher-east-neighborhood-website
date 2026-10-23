import 'server-only'

import { type HumanVerifier, SlidingWindowCounter } from '@/platform/lib'

import { isRefusal } from '../data/failures'
import { createResidentAccount, deleteFailedSignUp } from '../data/signUp'
import type { SignUpValues } from '../domain/credentials'
import { SIGN_UP_LIMITS } from '../domain/signUpLimits'
import type { ActionResult, SignUpFailure } from '../domain/types'
import { logServerFailure } from './logServerFailure'

// In memory: the site runs as one PM2 process
const attempts = new SlidingWindowCounter(
  SIGN_UP_LIMITS.windowMs,
  SIGN_UP_LIMITS.trackedConnections,
)
const accounts = new SlidingWindowCounter(SIGN_UP_LIMITS.windowMs)
const SITE_WIDE = 'site'

/** Who is asking: the robot-check token the form sent, and the connection's IP when known. */
export type SignUpRequest = { token: string | null; ip: string | null }

/**
 * Creates a resident account, which Payload emails a verification link to (#187). First the
 * limits and the robot check, the same Turnstile check as the contact form (decision 0007); none
 * of them depends on the email. Then every request gets the same answer: an email an account
 * already uses is refused by Payload and answered like a new one, and a failure is logged rather
 * than shown, as for a reset link (#269), so no answer says whether an account exists
 * (docs/guidelines/security.md).
 */
export async function signUpResident(
  values: SignUpValues,
  { token, ip }: SignUpRequest,
  verifier: HumanVerifier,
): Promise<ActionResult<SignUpFailure>> {
  const now = Date.now()
  // Without a known IP the per-connection limit can't apply; the site-wide one still does
  if (ip && !attempts.tryTake(ip, SIGN_UP_LIMITS.attemptsPerConnection, now)) {
    return { ok: false, failure: 'too-many' }
  }

  if (verifier.isEnabled()) {
    const check = await verifier.verify(token)
    if (!check.ok) {
      console.warn(`Sign-up robot check failed (${check.reason})`)
      return { ok: false, failure: 'robot-check' }
    }
  }

  if (!accounts.tryTake(SITE_WIDE, SIGN_UP_LIMITS.accountsSiteWide, now)) {
    console.warn('Sign-ups hit the site-wide hourly limit')
    return { ok: false, failure: 'too-many' }
  }

  const startedAt = new Date(now)
  try {
    await createResidentAccount(values)
  } catch (error) {
    // A refusal is an account that already uses the email: nothing to log or undo
    if (isRefusal(error)) return { ok: true }
    logServerFailure('Sign-up', error)
    // The account may be stored with its email unsent: remove it so the address isn't stuck
    await deleteFailedSignUp(values.email, startedAt).catch((cleanupError: unknown) =>
      logServerFailure('Sign-up cleanup', cleanupError),
    )
  }
  return { ok: true }
}
