/** An email the module sends: fixed text only, never anything a visitor typed (decision 0004). */
export type OutgoingEmail = { subject: string; text: string; html: string }

/** The path of the page a confirmation link opens. */
export const CONFIRM_EMAIL_PATH = '/confirm-email'

/** The link in a confirmation email: the confirm page, with the token in the query string. */
export function toConfirmationLink(siteUrl: string, token: string): string {
  const url = new URL(CONFIRM_EMAIL_PATH, siteUrl)
  url.searchParams.set('token', token)
  return url.toString()
}

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Email clients ignore stylesheets and CSS variables, so the brand colors are inline here: the
// light theme's primary and foreground tokens (docs/guidelines/nextjs-tailwind.md#design-tokens).
const PRIMARY = '#3d7a5e'
const FOREGROUND = '#1a1a1a'

/** Wraps paragraphs, and an optional button link, in the plain Sprecher East email layout. */
function toHtml(paragraphs: string[], button?: { label: string; href: string }): string {
  const body = paragraphs.map((p) => `<p style="margin:0 0 16px">${escapeHtml(p)}</p>`).join('')
  const action = button
    ? `<p style="margin:24px 0"><a href="${escapeHtml(button.href)}" style="background:${PRIMARY};color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">${escapeHtml(button.label)}</a></p>`
    : ''
  return `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:${FOREGROUND};max-width:560px">${body}${action}<p style="margin:24px 0 0;font-size:13px">Sprecher East, an unofficial, AI-assisted neighborhood website.</p></div>`
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
    html: toHtml([intro, outro], { label: 'Confirm my email', href: link }),
  }
}
