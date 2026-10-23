import { SIGN_UP_PATH } from './paths'

/**
 * The sign-up page's address, with the email to fill in when there is one (the confirm page's
 * "Yes", #187). Only a prefill: the account still needs Payload's own verification link.
 */
export function toSignUpHref(email: string | null): string {
  return email ? `${SIGN_UP_PATH}?${new URLSearchParams({ email })}` : SIGN_UP_PATH
}
