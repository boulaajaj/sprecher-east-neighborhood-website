import 'server-only'

import { isRefusal } from '../data/failures'
import { createResidentAccount } from '../data/signUp'
import type { SignUpValues } from '../domain/credentials'
import { logServerFailure } from './logServerFailure'

/**
 * Creates a resident account, which Payload emails a verification link to (#187). Every request
 * gets the same answer: an email an account already uses is refused by Payload and answered like
 * a new one, and a failure is logged rather than shown, as for a reset link (#269), so no answer
 * says whether an account exists (docs/guidelines/security.md).
 */
export async function signUpResident(values: SignUpValues): Promise<void> {
  try {
    await createResidentAccount(values)
  } catch (error) {
    // A refusal is an account that already uses the email: nothing to log
    if (!isRefusal(error)) logServerFailure('Sign-up', error)
  }
}
