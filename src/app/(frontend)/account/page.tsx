import type { Metadata } from 'next'

import { ChangePasswordForm, requireUser } from '@/modules/accounts/server'
import { NOT_INDEXED } from '@/platform/seo/notIndexed'
import { Card } from '@/platform/ui/Card'

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
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Name</dt>
              <dd className="text-foreground">{user.name || 'Not set'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="text-foreground">{user.email}</dd>
            </div>
          </dl>
        </Card>

        <Card as="section" variant="muted">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Change Password</h2>
          <ChangePasswordForm />
        </Card>
      </div>
    </div>
  )
}
