import 'server-only'

import { sendResetLink } from '../data/passwordReset'
import type { ForgotPasswordValues } from '../domain/credentials'
import { logServerFailure } from './logServerFailure'

/**
 * Emails a reset link if an account uses the email. Every request gets the same answer, even when
 * sending fails: Payload only sends for an existing account, so a different answer on failure
 * would say that one exists (#269, docs/guidelines/security.md). A failure is logged instead.
 */
export async function requestPasswordReset(values: ForgotPasswordValues): Promise<void> {
  try {
    await sendResetLink(values)
  } catch (error) {
    logServerFailure('Password reset request', error)
  }
}
