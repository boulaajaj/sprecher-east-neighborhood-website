'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { z } from 'zod'

import { Button, Field, Form, type FormStatus } from '@/platform/ui'

import { toLoginErrorMessage } from './loginErrorMessage'

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Enter your email address'),
  password: z.string().min(1, 'Enter your password'),
})

export function LoginForm() {
  const router = useRouter()
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Never the server's text (#204): it could say whether the account exists
  const fail = (httpStatus: number | null) => {
    setErrorMessage(toLoginErrorMessage(httpStatus))
    setStatus('error')
  }

  const logIn = async (values: z.output<typeof loginSchema>) => {
    setStatus('submitting')
    let res: Response
    try {
      res = await fetch('/api/users/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
    } catch {
      return fail(null)
    }
    if (!res.ok) return fail(res.status)

    router.push('/account')
    router.refresh()
    setStatus('idle')
  }

  return (
    <Form
      aria-label="Log in"
      schema={loginSchema}
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
