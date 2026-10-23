'use server'

// Server actions are public endpoints: anyone can call them with any input
// (https://nextjs.org/docs/app/guides/data-security). Each one parses its input again and finds
// the account from the session, never from what the caller sends.

import {
  forgotPasswordSchema,
  passwordChangeSchema,
  resetPasswordSchema,
  signInSchema,
} from './domain/credentials'
import type {
  AccountSummary,
  ActionResult,
  ForgotPasswordFailure,
  PasswordFailure,
  ResetPasswordFailure,
  SignInFailure,
} from './domain/types'
import { changeOwnPassword } from './use-cases/changeOwnPassword'
import { getAccountSummary } from './use-cases/getAccountSummary'
import { requestPasswordReset } from './use-cases/requestPasswordReset'
import { resetPasswordFromLink } from './use-cases/resetPasswordFromLink'
import { signInWithPassword } from './use-cases/signInWithPassword'
import { signOutCurrentUser } from './use-cases/signOutCurrentUser'

/** Signs in with an email and password. Input that doesn't parse reads like a wrong password. */
export async function signIn(input: unknown): Promise<ActionResult<SignInFailure>> {
  const parsed = signInSchema.safeParse(input)
  if (!parsed.success) return { ok: false, failure: 'wrong-credentials' }
  return signInWithPassword(parsed.data)
}

/** Signs out of this session and clears the auth cookie. */
export async function signOut(): Promise<void> {
  await signOutCurrentUser()
}

/**
 * Changes the signed-in account's own password, after checking its current one. There is no way
 * to name another account.
 */
export async function changePassword(input: unknown): Promise<ActionResult<PasswordFailure>> {
  const parsed = passwordChangeSchema.safeParse(input)
  if (!parsed.success) return { ok: false, failure: 'rejected' }
  return changeOwnPassword(parsed.data)
}

/**
 * Emails a link to reset a forgotten password. The answer is the same whether or not an account
 * uses the email; only input that doesn't parse is refused.
 */
export async function forgotPassword(input: unknown): Promise<ActionResult<ForgotPasswordFailure>> {
  const parsed = forgotPasswordSchema.safeParse(input)
  if (!parsed.success) return { ok: false, failure: 'rejected' }
  await requestPasswordReset(parsed.data)
  return { ok: true }
}

/** Sets a new password from a reset link's token. Input that doesn't parse is refused. */
export async function resetPassword(input: unknown): Promise<ActionResult<ResetPasswordFailure>> {
  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) return { ok: false, failure: 'rejected' }
  return resetPasswordFromLink(parsed.data)
}

/**
 * The header's view of who is signed in, or null. An action, not a server render, because most
 * pages are static and the header stays mounted across navigation.
 */
export async function getSignedInAccount(): Promise<AccountSummary | null> {
  return getAccountSummary()
}
