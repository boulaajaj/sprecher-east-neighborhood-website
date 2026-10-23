'use client'

import React, { useState } from 'react'

import { Button, Field, Form, type FormStatus, Link } from '@/platform/ui'

import { forgotPassword } from '../actions'
import { forgotPasswordSchema, type ForgotPasswordValues } from '../domain/credentials'
import { SIGN_IN_PATH } from '../domain/paths'
import type { ForgotPasswordFailure } from '../domain/types'
import { toForgotPasswordErrorMessage } from './resetErrorMessages'

/**
 * Asks for a reset link (#269). The answer never says whether an account uses the email: the
 * same text shows for every request (docs/guidelines/security.md).
 */
export const FORGOT_PASSWORD_SENT =
  'If an account uses that email, we’ve sent it a link to choose a new password. The link works for one hour. Check your spam folder if it doesn’t arrive in a few minutes.'

/** The form on /forgot-password. */
export function ForgotPasswordForm() {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const fail = (failure: ForgotPasswordFailure | 'offline') => {
    setErrorMessage(toForgotPasswordErrorMessage(failure))
    setStatus('error')
  }

  const send = async (values: ForgotPasswordValues) => {
    setStatus('submitting')
    let result: Awaited<ReturnType<typeof forgotPassword>>
    try {
      result = await forgotPassword(values)
    } catch {
      return fail('offline')
    }
    if (!result.ok) return fail(result.failure)
    setStatus('success')
  }

  return (
    <div className="space-y-6">
      <Form
        aria-label="Reset password"
        schema={forgotPasswordSchema}
        defaultValues={{}} // keeps an email typed or autofilled before the page loaded
        onSubmit={send}
        status={status}
        successMessage={FORGOT_PASSWORD_SENT}
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
            <div>
              <Button type="submit" loading={status === 'submitting'} fullWidth>
                {status === 'submitting' ? 'Sending' : 'Send Reset Link'}
              </Button>
            </div>
          </>
        )}
      </Form>
      <Link href={SIGN_IN_PATH} variant="action">
        Back to log in
      </Link>
    </div>
  )
}
