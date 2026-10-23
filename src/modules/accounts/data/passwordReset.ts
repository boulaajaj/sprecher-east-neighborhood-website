import 'server-only'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { ForgotPasswordValues, ResetPasswordValues } from '../domain/credentials'

const USERS = 'users'

/**
 * Asks Payload's `forgotPassword` operation to email a reset link. Payload makes the token, sets
 * its expiry, sends at most one email per account every 15 seconds, and does nothing for an
 * unknown email. The email itself is the users collection's (`auth.forgotPassword`). Throws when
 * Payload fails, for example when the email can't be sent.
 */
export async function sendResetLink({ email }: ForgotPasswordValues): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  await payload.forgotPassword({
    collection: USERS,
    data: { email },
    // As `POST /api/users/forgot-password` runs it: no user, so nothing to bypass
    overrideAccess: false,
  })
}

/**
 * Sets a new password with Payload's `resetPassword` operation, which checks the token and its
 * expiry, uses it up, unlocks the account and ends every other session. Throws Payload's error
 * when it refuses (403: unknown or expired token; 400: the password).
 *
 * Payload also starts a session and returns its token; no cookie is set from it, so the person
 * signs in with the new password next. That unused session expires with the token's lifetime.
 */
export async function setPasswordFromLink({
  token,
  newPassword,
}: Pick<ResetPasswordValues, 'token' | 'newPassword'>): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  await payload.resetPassword({
    collection: USERS,
    data: { token, password: newPassword },
    // As `POST /api/users/reset-password` runs it: the returned user is read with access rules
    overrideAccess: false,
  })
}
