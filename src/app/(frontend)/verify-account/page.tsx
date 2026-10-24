import type { Metadata } from 'next'

import { parseLinkToken } from '@/modules/accounts'
import { VerifyAccount } from '@/modules/accounts/server'

export const metadata: Metadata = {
  title: 'Confirm Your Account',
  description: 'Confirm the email of your new Sprecher East account.',
  // The token is in this page's address: never send it to another site, never index it
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
}

type Props = { searchParams: Promise<{ token?: string | string[] }> }

/**
 * Where the link in Payload's verification email lands (#187). The page confirms the email as soon
 * as it loads (#300); then the person logs in.
 */
export default async function VerifyAccountPage({ searchParams }: Props) {
  const { token } = await searchParams

  return (
    <div className="container flex min-h-[60vh] items-center py-16">
      <div className="mx-auto w-full max-w-md">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Confirm Your Account</h1>
        <p className="mb-8 text-muted-foreground">
          Thanks for opening the link. Once your email is confirmed, log in with the password you
          chose.
        </p>
        <VerifyAccount token={parseLinkToken(token)} />
      </div>
    </div>
  )
}
