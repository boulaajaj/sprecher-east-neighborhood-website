import type { Metadata } from 'next'

import { parseLinkToken } from '@/modules/accounts'
import { ResetPasswordForm } from '@/modules/accounts/server'
import { NOT_INDEXED } from '@/platform/seo/notIndexed'
import { PageHeader } from '@/platform/ui/PageHeader'
import { Section } from '@/platform/ui/Section'

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
    <Section as="div" width="narrow" spacing="center">
      <PageHeader
        variant="compact"
        title="Choose a New Password"
        description="Choose a new password for your account, then log in with it."
      />
      <ResetPasswordForm token={parseLinkToken(token)} />
    </Section>
  )
}
