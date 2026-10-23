import 'server-only'

import { APIError } from 'payload'

import type { PasswordFailure, ResetPasswordFailure, SignInFailure } from '../domain/types'

// Payload refuses with an APIError carrying an HTTP status; these turn it into the module's own
// failure codes, the same split the sign-in and password forms made by status before (#204).

/** The status Payload gave the error, or 500 when it isn't one of Payload's refusals. */
const statusOf = (error: unknown): number => (error instanceof APIError ? error.status : 500)

/**
 * Whether Payload refused the credentials (wrong password, unknown email, locked or unverified
 * account) rather than failing on our side.
 */
export const isRefusal = (error: unknown): boolean => statusOf(error) < 500

/** Any refusal below 500 is `wrong-credentials`, so no answer reveals whether an account exists. */
export function toSignInFailure(error: unknown): SignInFailure {
  return isRefusal(error) ? 'wrong-credentials' : 'server-error'
}

/** 401 and 403: the session is gone or no longer allowed; 400: Payload refused the password. */
export function toPasswordFailure(error: unknown): PasswordFailure {
  const status = statusOf(error)
  if (status === 401 || status === 403) return 'signed-out'
  if (status === 400) return 'rejected'
  return 'server-error'
}

/** 403: Payload doesn't know the token or it expired; 400: Payload refused the password. */
export function toResetPasswordFailure(error: unknown): ResetPasswordFailure {
  const status = statusOf(error)
  if (status === 403) return 'invalid-link'
  if (status === 400) return 'rejected'
  return 'server-error'
}
