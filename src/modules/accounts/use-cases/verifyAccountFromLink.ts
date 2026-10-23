import 'server-only'

import { toVerifyAccountFailure } from '../data/failures'
import { verifyAccountToken } from '../data/signUp'
import type { VerifyAccountValues } from '../domain/credentials'
import type { ActionResult, VerifyAccountFailure } from '../domain/types'
import { logServerFailure } from './logServerFailure'

/** Verifies an account from its link (#187). An unknown or used link is one failure. */
export async function verifyAccountFromLink(
  values: VerifyAccountValues,
): Promise<ActionResult<VerifyAccountFailure>> {
  try {
    await verifyAccountToken(values)
    return { ok: true }
  } catch (error) {
    const failure = toVerifyAccountFailure(error)
    if (failure === 'server-error') logServerFailure('Account verification', error)
    return { ok: false, failure }
  }
}
