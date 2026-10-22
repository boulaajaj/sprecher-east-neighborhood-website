'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { Button, Field, Form, type FormStatus } from '@/platform/ui'

import { signIn } from '../actions'
import { signInSchema, type SignInValues } from '../domain/credentials'
import type { SignInFailure } from '../domain/types'
import { toSignInErrorMessage } from './signInErrorMessage'

/** The sign-in form on /login. On success it opens /account. */
export function SignInForm() {
  const router = useRouter()
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Never the server's text (#204): it could say whether the account exists
  const fail = (failure: SignInFailure | 'offline') => {
    setErrorMessage(toSignInErrorMessage(failure))
    setStatus('error')
  }

  const logIn = async (values: SignInValues) => {
    setStatus('submitting')
    let result: Awaited<ReturnType<typeof signIn>>
    try {
      result = await signIn(values)
    } catch {
      return fail('offline')
    }
    if (!result.ok) return fail(result.failure)

    router.push('/account')
    router.refresh()
    setStatus('idle')
  }

  return (
    <Form
      aria-label="Log in"
      schema={signInSchema}
      defaultValues={{}} // keeps an email typed or autofilled before the page loaded
      onSubmit={logIn}
      status={status}
      errorMessage={errorMessage}
    >
      {({ register, formState: { errors } }) => (
        <>
          <Field label="Email" required error={errors.email?.message}>
            <Field.Input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email')}
            />
          </Field>
          <Field label="Password" required error={errors.password?.message}>
            <Field.Input
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
          </Field>
          <div>
            <Button type="submit" loading={status === 'submitting'} fullWidth>
              {status === 'submitting' ? 'Logging in' : 'Log In'}
            </Button>
          </div>
        </>
      )}
    </Form>
  )
}
