import 'server-only'

import { toPasswordFailure } from '../data/failures'
import { setOwnPassword } from '../data/session'
import type { ActionResult, PasswordFailure } from '../domain/types'
import { logServerFailure } from './logServerFailure'

/**
 * Sets a new password on the signed-in account. Who that is comes from the session, checked
 * again here, never from the caller.
 */
export async function changeOwnPassword(
  newPassword: string,
): Promise<ActionResult<PasswordFailure>> {
  try {
    const changed = await setOwnPassword(newPassword)
    return changed ? { ok: true } : { ok: false, failure: 'signed-out' }
  } catch (error) {
    const failure = toPasswordFailure(error)
    if (failure === 'server-error') logServerFailure('Password change', error)
    return { ok: false, failure }
  }
}
