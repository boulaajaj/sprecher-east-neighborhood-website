import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

/**
 * Payload email adapter (password resets, form-builder emails) built from SMTP_* env vars.
 * Production sends through Mailgun SMTP. With no SMTP_HOST (local dev, CI builds) this
 * returns undefined and Payload keeps its default: emails are written to the server log.
 *
 * A misconfiguration logs an error and also falls back to the console instead of throwing:
 * this runs at config load, so a throw would take every Payload route down at runtime.
 */
export function emailAdapterFromEnv(): ReturnType<typeof nodemailerAdapter> | undefined {
  const host = process.env.SMTP_HOST
  if (!host) return undefined

  const fromAddress = process.env.SMTP_FROM_ADDRESS
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  const problems = [
    !fromAddress && 'SMTP_FROM_ADDRESS is missing',
    Boolean(user) !== Boolean(pass) && 'SMTP_USER and SMTP_PASS must be set together',
  ].filter(Boolean)
  if (problems.length > 0 || !fromAddress) {
    console.error(`[email] SMTP disabled, emails go to the log: ${problems.join('; ')}`)
    return undefined
  }

  const port = Number(process.env.SMTP_PORT || 587)
  const secure = port === 465

  return nodemailerAdapter({
    defaultFromAddress: fromAddress,
    defaultFromName: process.env.SMTP_FROM_NAME || 'Sprecher East',
    // Don't open an authenticated SMTP connection every time the config loads (build,
    // migrate, cold start); a bad setting shows up in the log on the first send instead.
    skipVerify: true,
    transportOptions: {
      host,
      port,
      // 465 = implicit TLS. On other ports, when logging in, insist on STARTTLS so the
      // password is never sent over a plain connection (a local test catcher needs no login).
      secure,
      requireTLS: !secure && Boolean(user),
      // Fail fast instead of nodemailer's 2-minute defaults if Mailgun is unreachable
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
      ...(user ? { auth: { user, pass } } : {}),
    },
  })
}
