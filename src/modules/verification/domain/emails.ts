import { type OutgoingEmail, toEmailHtml } from '@/platform/lib'

import { CONFIRM_EMAIL_PATH } from './paths'

/** The link in a confirmation email: the confirm page, with the token in the query string. */
export function toConfirmationLink(siteUrl: string, token: string): string {
  const url = new URL(CONFIRM_EMAIL_PATH, siteUrl)
  url.searchParams.set('token', token)
  return url.toString()
}

/** The confirmation email: the only email sent to an address before its owner clicks (#183). */
export function toConfirmationEmail(link: string): OutgoingEmail {
  const intro =
    'Someone used this address on the Sprecher East website. If it was you, please confirm it:'
  const outro =
    'The link works once, for 24 hours. If you didn’t ask for this, ignore this email and nothing happens.'
  return {
    subject: 'Confirm your email for Sprecher East',
    text: `${intro}\n\n${link}\n\n${outro}\n`,
    html: toEmailHtml([intro, outro], { label: 'Confirm my email', href: link }),
  }
}

/** The welcome email, sent once, after the link is clicked (#183). */
export function toWelcomeEmail(siteUrl: string): OutgoingEmail {
  const paragraphs = [
    'Thanks for confirming your email, and thanks for reaching out to Sprecher East.',
    'If you wrote to us, we have your message and will get back to you. In the meantime, see what’s happening in the neighborhood:',
  ]
  const home = new URL('/', siteUrl).toString()
  return {
    subject: 'Welcome to Sprecher East',
    text: `${paragraphs.join('\n\n')}\n\n${home}\n`,
    html: toEmailHtml(paragraphs, { label: 'Visit Sprecher East', href: home }),
  }
}
