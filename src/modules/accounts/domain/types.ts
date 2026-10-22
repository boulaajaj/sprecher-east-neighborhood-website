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

/** Why a password change failed: nobody signed in, Payload refused it, or something broke. */
export type PasswordFailure = 'signed-out' | 'rejected' | 'server-error'

/** What a server action that changes something returns. Failures are fixed codes, never text. */
export type ActionResult<Failure extends string> = { ok: true } | { ok: false; failure: Failure }
