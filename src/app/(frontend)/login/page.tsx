import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { ACCOUNT_PATH } from '@/modules/accounts'
import { getCurrentUser, SignInForm } from '@/modules/accounts/server'
import { NOT_INDEXED } from '@/platform/seo/notIndexed'
import { PageHeader } from '@/platform/ui/PageHeader'
import { FormPage } from '@/platform/ui/FormPage'

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to your Sprecher East account.',
  robots: NOT_INDEXED,
}

export default async function LoginPage() {
  // Already signed in: nothing to do here
  if (await getCurrentUser()) redirect(ACCOUNT_PATH)

  return (
    <FormPage>
      <PageHeader
        variant="compact"
        title="Log In"
        description="Log in to your Sprecher East account."
      />
      <SignInForm />
    </FormPage>
  )
}
