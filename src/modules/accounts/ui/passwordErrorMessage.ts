import { FORM_MESSAGES } from '@/platform/ui'

import type { PasswordFailure } from '../domain/types'

/**
 * What a resident reads when changing the password fails. Fixed texts only, never the server's
 * message (#204). `offline`: the request got no answer.
 */
export function toPasswordErrorMessage(failure: PasswordFailure | 'offline'): string {
  if (failure === 'offline') return FORM_MESSAGES.offline
  if (failure === 'signed-out') {
    return 'Your session has ended. Log in again, then change your password.'
  }
  if (failure === 'wrong-password') return 'Your current password isn’t right. Please try again.'
  if (failure === 'rejected') {
    return 'That password can’t be used. Choose a different one and try again.'
  }
  return 'We couldn’t update your password. Please try again in a few minutes.'
}
