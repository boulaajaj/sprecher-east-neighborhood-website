import type { Metadata } from 'next'

import { getMeUser } from '@/utilities/getMeUser'
import { ChangePasswordForm } from './ChangePasswordForm'

export const metadata: Metadata = {
  title: 'Account',
  description: 'Manage your Sprecher East account.',
}

export default async function AccountPage() {
  const { user } = await getMeUser({ nullUserRedirect: '/login' })

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Account</h1>

        <div className="mb-8 rounded-lg border border-border bg-surface p-6">
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
        </div>

        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Change Password</h2>
          <ChangePasswordForm userId={user.id} />
        </div>
      </div>
    </div>
  )
}
