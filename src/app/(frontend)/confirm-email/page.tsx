import type { Metadata } from 'next'

import { parseConfirmationToken } from '@/modules/verification'
import { ConfirmEmail } from '@/modules/verification/server'

export const metadata: Metadata = {
  title: 'Confirm Your Email',
  description: 'Confirm your email address for Sprecher East.',
  // The token is in this page's address: never send it to another site, never index it
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
}

type Props = { searchParams: Promise<{ token?: string | string[] }> }

/** Where a confirmation link lands (#183). Confirming takes a click, not the page load. */
export default async function ConfirmEmailPage({ searchParams }: Props) {
  const { token } = await searchParams

  return (
    <div className="container flex min-h-[60vh] items-center py-16">
      <div className="mx-auto w-full max-w-md">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Confirm Your Email</h1>
        <p className="mb-8 text-muted-foreground">
          One click to confirm this address is yours. Then we’ll send you a welcome email.
        </p>
        {/* A dead link offers the contact form, where sending again brings a new link */}
        <ConfirmEmail token={parseConfirmationToken(token)} retryHref="/contact" />
      </div>
    </div>
  )
}
