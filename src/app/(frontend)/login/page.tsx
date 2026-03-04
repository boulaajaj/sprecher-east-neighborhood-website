import type { Metadata } from 'next'

import { getMeUser } from '@/utilities/getMeUser'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to your Sprecher East account.',
}

export default async function LoginPage() {
  await getMeUser({ validUserRedirect: '/account' })

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Log In</h1>
        <p className="mb-8 text-muted-foreground">Log in to your Sprecher East account.</p>
        <LoginForm />
      </div>
    </div>
  )
}
