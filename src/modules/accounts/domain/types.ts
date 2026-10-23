import type { Role } from '@/platform/lib'

/** Who is signed in, as pages and server actions need it. */
export type CurrentUser = {
  id: number
  email: string
  /** `null` when the account has no name */
  name: string | null
  role: Role
}

/** What the header shows for the signed-in account; nothing more about it leaves the server. */
export type AccountSummary = {
  name: string | null
}

/**
 * Why signing in failed. A wrong password, an unknown email and a locked account are all
 * `wrong-credentials`, so a visitor can't tell whether an account exists (#204).
 */
export type SignInFailure = 'wrong-credentials' | 'server-error'

/**
 * Why a password change failed: nobody signed in, the current password was refused (wrong, or
 * the account is locked: one code, #233), Payload refused the new one, or something broke.
 */
export type PasswordFailure = 'signed-out' | 'wrong-password' | 'rejected' | 'server-error'

/**
 * Why setting a password from a reset link failed: the link is unknown, used or expired (one
 * code), Payload refused the new password, or something broke.
 */
export type ResetPasswordFailure = 'invalid-link' | 'rejected' | 'server-error'

/**
 * Why asking for a reset link failed. Only input that doesn't parse: every request that does
 * gets the same answer, whether or not an account uses the email (no enumeration, #269).
 */
export type ForgotPasswordFailure = 'rejected'

/** What a server action that changes something returns. Failures are fixed codes, never text. */
export type ActionResult<Failure extends string> = { ok: true } | { ok: false; failure: Failure }
