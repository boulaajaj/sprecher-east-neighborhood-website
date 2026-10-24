import type { Metadata } from 'next'

import { parseLinkToken } from '@/modules/accounts'
import { ResetPasswordForm } from '@/modules/accounts/server'
import { NOT_INDEXED } from '@/platform/seo/notIndexed'

export const metadata: Metadata = {
  title: 'Choose a New Password',
  description: 'Choose a new password for your Sprecher East account.',
  // The token is in this page's address: never send it to another site, never index it
  referrer: 'no-referrer',
  robots: NOT_INDEXED,
}

type Props = { searchParams: Promise<{ token?: string | string[] }> }

/** Where a reset link lands (#269). Setting the password takes the form, not the page load. */
export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams

  return (
    <div className="container flex min-h-[60vh] items-center py-16">
      <div className="mx-auto w-full max-w-md">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Choose a New Password</h1>
        <p className="mb-8 text-muted-foreground">
          Choose a new password for your account, then log in with it.
        </p>
        <ResetPasswordForm token={parseLinkToken(token)} />
      </div>
    </div>
  )
}
