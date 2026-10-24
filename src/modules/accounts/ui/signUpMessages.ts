import { FORM_MESSAGES } from '@/platform/ui'

import type { SignUpFailure, VerifyAccountFailure } from '../domain/types'
import { VERIFICATION_RESENDS } from '../domain/verificationResends'
import { GUARD_MESSAGES } from './guardMessages'

/**
 * What every sign-up that passes the checks is told (#187). It never says whether an account
 * already uses the email (docs/guidelines/security.md), and it gives everyone the same hint about
 * resending, rather than saying when an address reached its cap (#289).
 */
export const SIGN_UP_SENT = `Check your email. If the address can have a new account, we’ve sent it a link to confirm it. Open the link to finish, then log in. No email after a few minutes? Check your spam folder, then sign up again to get a new link. After ${VERIFICATION_RESENDS.perWindow} tries, wait ${VERIFICATION_RESENDS.windowMs / 3_600_000} hours.`

/** What a visitor reads when signing up fails. `offline`: no answer came back. */
export function toSignUpErrorMessage(failure: SignUpFailure | 'offline'): string {
  if (failure === 'offline') return FORM_MESSAGES.offline
  if (failure === 'robot-check' || failure === 'too-many') return GUARD_MESSAGES[failure]
  return 'Check the form and try again.'
}

/** The answer to opening a verification link that worked. */
export const ACCOUNT_VERIFIED =
  'Your email is confirmed and your account is ready. Log in with the password you chose.'

/**
 * What a visitor reads when the link was resent after a second sign-up (#289): the account opens
 * with the password chosen here, not one from an earlier sign-up.
 */
export const CHOOSE_PASSWORD_TO_VERIFY =
  'Choose a password to finish. This link was sent again after a new sign-up, so your account uses the password you choose now.'

/**
 * What a visitor reads when a verification link doesn't work. Fixed texts only, never the
 * server's message (#204). `offline`: the request got no answer.
 */
export function toVerifyAccountErrorMessage(failure: VerifyAccountFailure | 'offline'): string {
  if (failure === 'offline') return FORM_MESSAGES.offline
  if (failure === 'invalid-link') {
    return 'This link isn’t valid or was already used. If you already confirmed your account, log in.'
  }
  if (failure === 'needs-password') return CHOOSE_PASSWORD_TO_VERIFY
  if (failure === 'robot-check') return GUARD_MESSAGES['robot-check']
  return 'We couldn’t confirm your account. Please try again in a few minutes.'
}
