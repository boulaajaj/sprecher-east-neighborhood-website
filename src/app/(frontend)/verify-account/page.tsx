import type { Metadata } from 'next'

import { parseLinkToken } from '@/modules/accounts'
import { VerifyAccount } from '@/modules/accounts/server'
import { NOT_INDEXED } from '@/platform/seo/notIndexed'

export const metadata: Metadata = {
  title: 'Confirm Your Account',
  description: 'Confirm the email of your new Sprecher East account.',
  // The token is in this page's address: never send it to another site, never index it
  referrer: 'no-referrer',
  robots: NOT_INDEXED,
}

type Props = { searchParams: Promise<{ token?: string | string[] }> }

/**
 * Where the link in Payload's verification email lands (#187). Confirming takes a click, not the
 * page load; then the person logs in.
 */
export default async function VerifyAccountPage({ searchParams }: Props) {
  const { token } = await searchParams

  return (
    <div className="container flex min-h-[60vh] items-center py-16">
      <div className="mx-auto w-full max-w-md">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Confirm Your Account</h1>
        <p className="mb-8 text-muted-foreground">
          One click to confirm this email is yours. Then log in with the password you chose.
        </p>
        <VerifyAccount token={parseLinkToken(token)} />
      </div>
    </div>
  )
}
