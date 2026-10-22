import { FORM_MESSAGES } from '@/platform/ui'

/**
 * What a visitor reads when logging in fails, picked by HTTP status. Fixed texts only (#204):
 * none of them says whether an account exists for the email, or that it is locked.
 * `null`: the request never got an answer.
 */
export function toLoginErrorMessage(status: number | null): string {
  if (status === null) return FORM_MESSAGES.offline
  if (status === 429) return FORM_MESSAGES.tooManyTries
  if (status >= 500) return 'Something went wrong on our side. Please try again in a few minutes.'
  return 'Invalid email or password. Please try again.'
}
