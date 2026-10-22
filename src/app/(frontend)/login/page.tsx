import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getCurrentUser, SignInForm } from '@/modules/accounts/server'

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to your Sprecher East account.',
}

export default async function LoginPage() {
  // Already signed in: nothing to do here
  if (await getCurrentUser()) redirect('/account')

  return (
    <div className="container flex min-h-[60vh] items-center py-16">
      <div className="mx-auto w-full max-w-md">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Log In</h1>
        <p className="mb-8 text-muted-foreground">Log in to your Sprecher East account.</p>
        <SignInForm />
      </div>
    </div>
  )
}
