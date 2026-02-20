import { NextRequest, NextResponse } from 'next/server'

/**
 * Contact form API route.
 *
 * Currently: logs submissions server-side (safe for dev / staging).
 *
 * To wire up real email delivery:
 *   Option A — Formspree: Replace this route with a direct Formspree endpoint in ContactForm.tsx
 *              (no API route needed, just POST to https://formspree.io/f/YOUR_FORM_ID)
 *   Option B — Netlify Forms: Add data-netlify="true" to the form element and remove this route
 *   Option C — Resend / SendGrid: Install the SDK and send via SMTP here
 */

interface ContactPayload {
  first_name: string
  last_name?: string
  email: string
  subject: string
  message: string
  join_list?: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ContactPayload

    // Basic validation
    if (!body.first_name?.trim()) {
      return NextResponse.json({ error: 'First name is required.' }, { status: 400 })
    }
    if (!body.email?.trim() || !isValidEmail(body.email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }
    if (!body.subject?.trim()) {
      return NextResponse.json({ error: 'Please select a topic.' }, { status: 400 })
    }
    if (!body.message?.trim() || body.message.trim().length < 10) {
      return NextResponse.json({ error: 'Please include a message (at least 10 characters).' }, { status: 400 })
    }

    // TODO: Send email via Resend, SendGrid, Postmark, etc.
    // For now, log it server-side
    console.log('[Contact form submission]', {
      name: `${body.first_name} ${body.last_name ?? ''}`.trim(),
      email: body.email,
      subject: body.subject,
      message: body.message,
      wantsUpdates: body.join_list === 'on',
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('[Contact form error]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// Reject non-POST methods
export function GET() {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 })
}
