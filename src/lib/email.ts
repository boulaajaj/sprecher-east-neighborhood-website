import nodemailer from 'nodemailer'

// ---------------------------------------------------------------------------
// AWS SES SMTP transport for contact form emails
// ---------------------------------------------------------------------------

const SMTP_HOST = process.env.SMTP_HOST || 'email-smtp.us-east-1.amazonaws.com'
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587
const SMTP_USER = process.env.SMTP_USER ?? ''
const SMTP_PASS = process.env.SMTP_PASS ?? ''
const CONTACT_TO = process.env.CONTACT_EMAIL_TO || 'sprechereast@gmail.com'
const CONTACT_FROM = process.env.CONTACT_EMAIL_FROM || 'sprechereast@gmail.com'

/** True when all required SMTP env vars are present */
export function isEmailConfigured(): boolean {
  return Boolean(SMTP_USER && SMTP_PASS)
}

/** Lazy-initialized transporter (created once per cold start) */
let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // TLS for 465, STARTTLS for 587
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  }
  return transporter
}

// ---------------------------------------------------------------------------
// Contact form email
// ---------------------------------------------------------------------------

export interface ContactEmailData {
  firstName: string
  lastName?: string
  email: string
  subject: string
  message: string
  wantsUpdates: boolean
}

const SUBJECT_LABELS: Record<string, string> = {
  membership: 'Joining / Membership',
  events: 'Events & Calendar',
  issue: 'Neighborhood Issue or Concern',
  board: 'Board of Directors',
  resources: 'Resources & Referrals',
  volunteer: 'Volunteering',
  general: 'General Question',
  other: 'Other',
}

/**
 * Send the contact form submission as a nicely-formatted email.
 *
 * Throws on failure — caller should catch and return 500.
 */
export async function sendContactEmail(data: ContactEmailData): Promise<void> {
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ')
  const topicLabel = SUBJECT_LABELS[data.subject] ?? data.subject

  const text = [
    `New message from ${fullName} <${data.email}>`,
    `Topic: ${topicLabel}`,
    `Newsletter opt-in: ${data.wantsUpdates ? 'Yes' : 'No'}`,
    '',
    '--- Message ---',
    data.message,
    '',
    '---',
    `Sent from the Sprecher East contact form at ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CT`,
  ].join('\n')

  const html = `
    <div style="font-family: sans-serif; max-width: 600px;">
      <h2 style="color: #3d7a5e; margin-bottom: 4px;">New Contact Form Message</h2>
      <p style="color: #6b6b6b; margin-top: 0;">from the Sprecher East website</p>
      <table style="border-collapse: collapse; width: 100%; margin-bottom: 16px;">
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; color: #1a1a1a; border-bottom: 1px solid #e2ddd6; width: 130px;">Name</td>
          <td style="padding: 8px 12px; color: #1a1a1a; border-bottom: 1px solid #e2ddd6;">${escapeHtml(fullName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; color: #1a1a1a; border-bottom: 1px solid #e2ddd6;">Email</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd6;"><a href="mailto:${escapeHtml(data.email)}" style="color: #3d7a5e;">${escapeHtml(data.email)}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; color: #1a1a1a; border-bottom: 1px solid #e2ddd6;">Topic</td>
          <td style="padding: 8px 12px; color: #1a1a1a; border-bottom: 1px solid #e2ddd6;">${escapeHtml(topicLabel)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; color: #1a1a1a; border-bottom: 1px solid #e2ddd6;">Newsletter</td>
          <td style="padding: 8px 12px; color: #1a1a1a; border-bottom: 1px solid #e2ddd6;">${data.wantsUpdates ? '&#9989; Yes, send updates' : 'No'}</td>
        </tr>
      </table>
      <div style="background: #f9f8f5; border-left: 4px solid #3d7a5e; padding: 16px; border-radius: 4px; margin-bottom: 16px;">
        <p style="margin: 0; color: #1a1a1a; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
      </div>
      <p style="font-size: 12px; color: #6b6b6b;">
        Sent from the Sprecher East contact form &middot;
        ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CT
      </p>
    </div>
  `.trim()

  await getTransporter().sendMail({
    from: `"Sprecher East" <${CONTACT_FROM}>`,
    to: CONTACT_TO,
    replyTo: `"${fullName}" <${data.email}>`,
    subject: `[Contact] ${topicLabel} — from ${fullName}`,
    text,
    html,
  })
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
