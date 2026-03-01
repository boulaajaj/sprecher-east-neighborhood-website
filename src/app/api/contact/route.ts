import { type NextRequest, NextResponse } from 'next/server'
import { isEmailConfigured, sendContactEmail } from '@/lib/email'

// ---------------------------------------------------------------------------
// Contact form API route — sends via AWS SES SMTP
// ---------------------------------------------------------------------------

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

    // --- Validation --------------------------------------------------------
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
      return NextResponse.json(
        { error: 'Please include a message (at least 10 characters).' },
        { status: 400 },
      )
    }

    // --- Send email --------------------------------------------------------
    if (isEmailConfigured()) {
      await sendContactEmail({
        firstName: body.first_name.trim(),
        lastName: body.last_name?.trim(),
        email: body.email.trim(),
        subject: body.subject.trim(),
        message: body.message.trim(),
        wantsUpdates: body.join_list === 'on',
      })
    } else {
      // Fallback: log to server console when SMTP is not configured (dev mode)
      console.warn('[Contact form — SMTP not configured, logging only]', {
        name: `${body.first_name} ${body.last_name ?? ''}`.trim(),
        email: body.email,
        subject: body.subject,
        wantsUpdates: body.join_list === 'on',
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('[Contact form error]', err)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 },
    )
  }
}

// Reject non-POST methods
export function GET() {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 })
}
