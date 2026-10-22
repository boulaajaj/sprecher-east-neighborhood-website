import { FORM_MESSAGES } from '@/platform/ui'

/**
 * What a resident reads when changing the password fails, picked by HTTP status. Fixed texts
 * only, never the server's message (#204). `null`: the request never got an answer.
 */
export function toPasswordErrorMessage(status: number | null): string {
  if (status === null) return FORM_MESSAGES.offline
  if (status === 401 || status === 403) {
    return 'Your session has ended. Log in again, then change your password.'
  }
  if (status === 429) return FORM_MESSAGES.tooManyTries
  if (status === 400) return 'That password can’t be used. Choose a different one and try again.'
  return 'We couldn’t update your password. Please try again in a few minutes.'
}
