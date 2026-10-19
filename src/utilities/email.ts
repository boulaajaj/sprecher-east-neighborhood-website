import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

/**
 * Payload email adapter (password resets, form-builder emails) built from SMTP_* env vars.
 * Production sends through Mailgun SMTP. With no SMTP_HOST (local dev, CI builds) this
 * returns undefined and Payload keeps its default: emails are written to the server log.
 */
export function emailAdapterFromEnv(): ReturnType<typeof nodemailerAdapter> | undefined {
  const host = process.env.SMTP_HOST
  if (!host) return undefined

  const fromAddress = process.env.SMTP_FROM_ADDRESS
  if (!fromAddress) {
    // Fail the build loudly rather than sending mail with no valid sender
    throw new Error('SMTP_HOST is set but SMTP_FROM_ADDRESS is missing')
  }

  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER

  return nodemailerAdapter({
    defaultFromAddress: fromAddress,
    defaultFromName: process.env.SMTP_FROM_NAME || 'Sprecher East',
    transportOptions: {
      host,
      port,
      // 465 = implicit TLS; 587 upgrades with STARTTLS
      secure: port === 465,
      ...(user ? { auth: { user, pass: process.env.SMTP_PASS } } : {}),
    },
  })
}
