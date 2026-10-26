import type { Metadata } from 'next'

import { ChangePasswordForm, requireUser } from '@/modules/accounts/server'
import { NOT_INDEXED } from '@/platform/seo/notIndexed'
import { Card } from '@/platform/ui/Card'
import { MetaList } from '@/platform/ui/MetaList'
import { PageHeader } from '@/platform/ui/PageHeader'
import { FormPage } from '@/platform/ui/FormPage'

export const metadata: Metadata = {
  title: 'Account',
  description: 'Manage your Sprecher East account.',
  robots: NOT_INDEXED,
}

export default async function AccountPage() {
  const user = await requireUser()

  return (
    <FormPage width="lg" align="top">
      <PageHeader variant="compact" title="Account" />

      <Card as="section" variant="muted" className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Profile</h2>
        <MetaList
          items={[
            { label: 'Name', value: user.name || 'Not set' },
            { label: 'Email', value: <span className="wrap-anywhere">{user.email}</span> },
          ]}
        />
      </Card>

      <Card as="section" variant="muted">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Change Password</h2>
        <ChangePasswordForm />
      </Card>
    </FormPage>
  )
}
