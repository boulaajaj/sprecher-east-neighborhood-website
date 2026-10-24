import { type OutgoingEmail, toEmailHtml } from '@/platform/lib'

/**
 * The fixed "we received your message" email (#274), for a sender whose address was confirmed
 * before, once their message has gone to the neighborhood team. A first-time sender gets the
 * verification module's welcome email instead, which says the same once they confirm, so nobody
 * gets both. Fixed text only: nothing the visitor typed goes into it.
 */
export function toAcknowledgmentEmail(siteUrl: string): OutgoingEmail {
  const paragraphs = [
    'Thanks for writing to Sprecher East. We received your message, and the neighborhood team will get back to you.',
    'You don’t need to do anything else. If you didn’t send a message, you can ignore this email.',
  ]
  const home = new URL('/', siteUrl).toString()
  return {
    subject: 'We received your message',
    text: `${paragraphs.join('\n\n')}\n\n${home}\n`,
    html: toEmailHtml(paragraphs, { label: 'Visit Sprecher East', href: home }),
  }
}
