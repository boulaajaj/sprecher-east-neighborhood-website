import 'server-only'

import { toPasswordFailure } from '../data/failures'
import { setOwnPassword } from '../data/session'
import type { PasswordChangeValues } from '../domain/credentials'
import type { ActionResult, PasswordFailure } from '../domain/types'
import { logServerFailure } from './logServerFailure'

/**
 * Sets a new password on the signed-in account, once its current password is confirmed (#233).
 * Who that is comes from the session, checked again here, never from the caller.
 */
export async function changeOwnPassword({
  currentPassword,
  newPassword,
}: PasswordChangeValues): Promise<ActionResult<PasswordFailure>> {
  try {
    const outcome = await setOwnPassword({ currentPassword, newPassword })
    return outcome === 'changed' ? { ok: true } : { ok: false, failure: outcome }
  } catch (error) {
    const failure = toPasswordFailure(error)
    if (failure === 'server-error') logServerFailure('Password change', error)
    return { ok: false, failure }
  }
}
