import type { Metadata } from 'next'

import { ChangePasswordForm, requireUser } from '@/modules/accounts/server'
import { NOT_INDEXED } from '@/platform/seo/notIndexed'
import { Card } from '@/platform/ui/Card'
import { MetaList } from '@/platform/ui/MetaList'

export const metadata: Metadata = {
  title: 'Account',
  description: 'Manage your Sprecher East account.',
  robots: NOT_INDEXED,
}

export default async function AccountPage() {
  const user = await requireUser()

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Account</h1>

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
      </div>
    </div>
  )
}
