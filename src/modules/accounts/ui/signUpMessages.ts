import { FORM_MESSAGES } from '@/platform/ui'

import type { SignUpFailure, VerifyAccountFailure } from '../domain/types'
import { GUARD_MESSAGES } from './guardMessages'

/**
 * What every sign-up that parses is told (#187). It never says whether an account already uses
 * the email (docs/guidelines/security.md).
 */
export const SIGN_UP_SENT =
  'Check your email. If the address can have a new account, we’ve sent it a link to confirm it. Open the link to finish, then log in. Check your spam folder if it doesn’t arrive in a few minutes.'

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
 * What a visitor reads when a verification link doesn't work. Fixed texts only, never the
 * server's message (#204). `offline`: the request got no answer.
 */
export function toVerifyAccountErrorMessage(failure: VerifyAccountFailure | 'offline'): string {
  if (failure === 'offline') return FORM_MESSAGES.offline
  if (failure === 'invalid-link') {
    return 'This link isn’t valid or was already used. If you already confirmed your account, log in.'
  }
  return 'We couldn’t confirm your account. Please try again in a few minutes.'
}
