import { FORM_MESSAGES } from '@/platform/ui'

import type { ForgotPasswordFailure, ResetPasswordFailure } from '../domain/types'

/** What a visitor reads when asking for a reset link fails. `offline`: no answer came back. */
export function toForgotPasswordErrorMessage(failure: ForgotPasswordFailure | 'offline'): string {
  if (failure === 'offline') return FORM_MESSAGES.offline
  return 'Check the email address and try again.'
}

/**
 * What a visitor reads when setting a password from a reset link fails. Fixed texts only, never
 * the server's message (#204). `offline`: the request got no answer.
 */
export function toResetPasswordErrorMessage(failure: ResetPasswordFailure | 'offline'): string {
  if (failure === 'offline') return FORM_MESSAGES.offline
  if (failure === 'invalid-link') {
    return 'This link has expired or was already used. Ask for a new one below.'
  }
  if (failure === 'rejected') {
    return 'That password can’t be used. Choose a different one and try again.'
  }
  return 'We couldn’t set your password. Please try again in a few minutes.'
}
