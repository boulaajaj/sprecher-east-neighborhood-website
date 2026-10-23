import { type OutgoingEmail, toEmailHtml } from '@/platform/lib'

import { RESET_PASSWORD_PATH } from './paths'

/**
 * The link in a reset email: the site's own reset page, with Payload's token in the query string.
 * Built from the configured site address, never from the request's Host header.
 */
export function toResetPasswordLink(siteUrl: string, token: string): string {
  const url = new URL(RESET_PASSWORD_PATH, siteUrl)
  url.searchParams.set('token', token)
  return url.toString()
}

/**
 * The email Payload's forgot-password operation sends (`auth.forgotPassword`). Payload sends
 * only the HTML, so the link is also written out in it for clients that hide buttons.
 */
export function toResetPasswordEmail(link: string): OutgoingEmail {
  const intro =
    'Someone asked to reset the password of the Sprecher East account that uses this email. If it was you, choose a new password:'
  const outro =
    'The link works once, for one hour. If you didn’t ask for this, ignore this email: your password stays the same.'
  return {
    subject: 'Reset your Sprecher East password',
    text: `${intro}\n\n${link}\n\n${outro}\n`,
    html: toEmailHtml([intro, link, outro], { label: 'Choose a new password', href: link }),
  }
}
