import 'server-only'

import { toSignInFailure } from '../data/failures'
import { startSession } from '../data/session'
import type { SignInValues } from '../domain/credentials'
import type { ActionResult, SignInFailure } from '../domain/types'
import { logServerFailure } from './logServerFailure'

/** Signs in and sets the auth cookie. Every refusal is the same failure (no enumeration). */
export async function signInWithPassword(
  values: SignInValues,
): Promise<ActionResult<SignInFailure>> {
  try {
    await startSession(values)
    return { ok: true }
  } catch (error) {
    const failure = toSignInFailure(error)
    if (failure === 'server-error') logServerFailure('Sign-in', error)
    return { ok: false, failure }
  }
}
