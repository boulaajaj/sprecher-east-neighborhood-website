import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { ForgotPasswordForm, getCurrentUser } from '@/modules/accounts/server'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Get a link to choose a new password for your Sprecher East account.',
}

/** Where a visitor asks for a link to reset a forgotten password (#269). */
export default async function ForgotPasswordPage() {
  // Signed in: the password is changed on the account page instead
  if (await getCurrentUser()) redirect('/account')

  return (
    <div className="container flex min-h-[60vh] items-center py-16">
      <div className="mx-auto w-full max-w-md">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Forgot Your Password?</h1>
        <p className="mb-8 text-muted-foreground">
          Enter the email you log in with. We’ll send you a link to choose a new password.
        </p>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
