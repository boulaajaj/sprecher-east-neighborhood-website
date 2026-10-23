import 'server-only'

import type { HumanVerifier } from '@/platform/lib'

import { isRefusal } from '../data/failures'
import { createResidentAccount, deleteFailedSignUp } from '../data/signUp'
import type { SignUpValues } from '../domain/credentials'
import { SIGN_UP_LIMITS } from '../domain/requestLimits'
import type { ActionResult, SignUpFailure } from '../domain/types'
import { createRequestGuard, type PublicRequest } from './guardPublicRequest'
import { logServerFailure } from './logServerFailure'

const guard = createRequestGuard('Sign-up', SIGN_UP_LIMITS)

/**
 * Creates a resident account, which Payload emails a verification link to (#187). First the
 * limits and the robot check (decision 0007); none of them depends on the email. Then every
 * request gets the same answer: an email an account already uses is refused by Payload and
 * answered like a new one, and a failure is logged rather than shown, as for a reset link (#269),
 * so no answer says whether an account exists (docs/guidelines/security.md).
 */
export async function signUpResident(
  values: SignUpValues,
  request: PublicRequest,
  verifier: HumanVerifier,
): Promise<ActionResult<SignUpFailure>> {
  const blocked = await guard(request, verifier)
  if (blocked) return { ok: false, failure: blocked }

  const startedAt = new Date()
  try {
    await createResidentAccount(values)
  } catch (error) {
    // A refusal is an account that already uses the email: nothing to log or undo
    if (isRefusal(error)) return { ok: true }
    logServerFailure('Sign-up', error)
    // The account may be stored with its email unsent: remove it so the address isn't stuck
    await deleteFailedSignUp(values.email, startedAt).catch((cleanupError: unknown) =>
      logServerFailure('Sign-up cleanup', cleanupError),
    )
  }
  return { ok: true }
}
