import type { Metadata } from 'next'

import { AccountOffer } from '@/modules/accounts/server'
import { parseConfirmationToken } from '@/modules/verification'
import { ConfirmEmail, getConfirmationLinkStatus } from '@/modules/verification/server'
import { cn } from '@/platform/lib/cn'
import { NOT_INDEXED } from '@/platform/seo/notIndexed'

export const metadata: Metadata = {
  title: 'Confirm Your Email',
  description: 'Confirm your email address for Sprecher East.',
  // The token is in this page's address: never send it to another site, never index it
  referrer: 'no-referrer',
  robots: NOT_INDEXED,
}

type Props = { searchParams: Promise<{ token?: string | string[] }> }

/**
 * Where a confirmation link lands (#183). Confirming takes a click, not the page load; the page
 * only reads where the link stands, so a link opened again after confirming says so (#391). Once
 * the email is confirmed, the accounts module offers an account (#187): the two modules meet here.
 */
export default async function ConfirmEmailPage({ searchParams }: Props) {
  const { token } = await searchParams
  const status = await getConfirmationLinkStatus(token)
  const alreadyConfirmed = status === 'already-confirmed'

  return (
    <div className="container flex min-h-[60vh] items-center py-16">
      <div className="mx-auto w-full max-w-md">
        <h1
          className={cn('text-3xl font-bold text-foreground', alreadyConfirmed ? 'mb-6' : 'mb-2')}
        >
          {alreadyConfirmed ? 'Email Confirmed' : 'Confirm Your Email'}
        </h1>
        {!alreadyConfirmed && (
          <p className="mb-8 text-muted-foreground">
            One click to confirm this address is yours. Then we’ll send you a welcome email.
          </p>
        )}
        {/* A dead link offers the contact form, where sending again brings a new link */}
        <ConfirmEmail token={parseConfirmationToken(token)} status={status} retryHref="/contact">
          <AccountOffer />
        </ConfirmEmail>
      </div>
    </div>
  )
}
