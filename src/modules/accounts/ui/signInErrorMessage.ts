import { FORM_MESSAGES } from '@/platform/ui'

import type { SignInFailure } from '../domain/types'

/**
 * What a visitor reads when signing in fails. Fixed texts only (#204): none of them says whether
 * an account exists for the email, or that it is locked. `offline`: the request got no answer.
 */
export function toSignInErrorMessage(failure: SignInFailure | 'offline'): string {
  if (failure === 'offline') return FORM_MESSAGES.offline
  if (failure === 'server-error') {
    return 'Something went wrong on our side. Please try again in a few minutes.'
  }
  return 'Invalid email or password. Please try again.'
}
