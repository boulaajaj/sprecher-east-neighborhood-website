import 'server-only'

import { toResetPasswordFailure } from '../data/failures'
import { setPasswordFromLink } from '../data/passwordReset'
import type { ResetPasswordValues } from '../domain/credentials'
import type { ActionResult, ResetPasswordFailure } from '../domain/types'
import { logServerFailure } from './logServerFailure'

/** Sets a new password from a reset link. A used, unknown or expired link is one failure. */
export async function resetPasswordFromLink({
  token,
  newPassword,
}: ResetPasswordValues): Promise<ActionResult<ResetPasswordFailure>> {
  try {
    await setPasswordFromLink({ token, newPassword })
    return { ok: true }
  } catch (error) {
    const failure = toResetPasswordFailure(error)
    if (failure === 'server-error') logServerFailure('Password reset', error)
    return { ok: false, failure }
  }
}
