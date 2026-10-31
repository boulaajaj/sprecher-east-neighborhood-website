import { type OutgoingEmail, toEmailHtml } from '@/platform/lib'

import { toLinkWithToken } from './linkToken'
import { VERIFY_ACCOUNT_PATH } from './paths'

/** The link in a verification email: the site's own verify page, with Payload's token. */
export const toVerifyAccountLink = (siteUrl: string, token: string): string =>
  toLinkWithToken(siteUrl, VERIFY_ACCOUNT_PATH, token)

/**
 * The email Payload sends when an account is created (`auth.verify`, #187). The account can't
 * sign in until its link is opened. Payload sends only the HTML, so the link is also written out
 * in it for clients that hide buttons.
 */
export function toVerifyAccountEmail(link: string): OutgoingEmail {
  const intro =
    'Someone used this email to create a Sprecher East account. If it was you, confirm your email to finish it:'
  const outro =
    'Then log in with the password you chose. If you didn’t ask for an account, ignore this email: the account can’t be used without this link.'
  return {
    subject: 'Confirm your email to finish your Sprecher East account',
    text: `${intro}\n\n${link}\n\n${outro}\n`,
    html: toEmailHtml([intro, link, outro], { label: 'Confirm my email', href: link }),
  }
}
