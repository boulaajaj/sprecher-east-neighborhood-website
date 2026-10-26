import type { Metadata } from 'next'

import { parseLinkToken } from '@/modules/accounts'
import { getVerificationLinkStatus, VerifyAccount } from '@/modules/accounts/server'
import { NOT_INDEXED } from '@/platform/seo/notIndexed'
import { PageHeader } from '@/platform/ui/PageHeader'
import { FormPage } from '@/platform/ui/FormPage'

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
 * page load; then the person logs in. The page only reads where the link stands, so a link opened
 * again after the account was verified says so (#391).
 */
export default async function VerifyAccountPage({ searchParams }: Props) {
  const { token } = await searchParams
  const status = await getVerificationLinkStatus(token)
  const alreadyVerified = status === 'already-verified'

  return (
    <FormPage>
      <PageHeader
        variant="compact"
        title={alreadyVerified ? 'Account Confirmed' : 'Confirm Your Account'}
        description={
          alreadyVerified
            ? undefined
            : 'One click to confirm this email is yours. Then log in with the password you chose.'
        }
      />
      <VerifyAccount token={parseLinkToken(token)} status={status} />
    </FormPage>
  )
}
