import 'server-only'

import { toSignInFailure } from '../data/failures'
import { startSession } from '../data/session'
import type { SignInValues } from '../domain/credentials'
import type { ActionResult, SignInFailure } from '../domain/types'

/** Signs in and sets the auth cookie. Every refusal is the same failure (no enumeration). */
export async function signInWithPassword(
  values: SignInValues,
): Promise<ActionResult<SignInFailure>> {
  try {
    await startSession(values)
    return { ok: true }
  } catch (error) {
    const failure = toSignInFailure(error)
    // Never the email or password: only what broke on our side
    if (failure === 'server-error') console.error('Sign-in failed on the server:', error)
    return { ok: false, failure }
  }
}
