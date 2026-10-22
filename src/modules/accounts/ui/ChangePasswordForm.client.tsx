'use client'

import React, { useState } from 'react'

import { Button, Field, Form, type FormApi, type FormStatus } from '@/platform/ui'

import { changePassword } from '../actions'
import {
  MIN_PASSWORD_LENGTH,
  passwordChangeSchema,
  type PasswordChangeValues,
} from '../domain/credentials'
import type { PasswordFailure } from '../domain/types'
import { toPasswordErrorMessage } from './passwordErrorMessage'

/** Changes the signed-in account's password. The account comes from the session, not a prop. */
export function ChangePasswordForm() {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Never the server's text (#204); the server logs the details
  const fail = (failure: PasswordFailure | 'offline') => {
    setErrorMessage(toPasswordErrorMessage(failure))
    setStatus('error')
  }

  const submit = async (
    values: PasswordChangeValues,
    form: FormApi<PasswordChangeValues, PasswordChangeValues>,
  ) => {
    setStatus('submitting')
    let result: Awaited<ReturnType<typeof changePassword>>
    try {
      result = await changePassword(values)
    } catch {
      return fail('offline')
    }
    if (!result.ok) return fail(result.failure)

    form.reset()
    setStatus('success')
  }

  return (
    <Form
      aria-label="Change password"
      schema={passwordChangeSchema}
      defaultValues={{}} // keeps what was typed before the page loaded
      onSubmit={submit}
      status={status}
      successMessage="Password updated."
      errorMessage={errorMessage}
    >
      {({ register, formState: { errors } }) => (
        <>
          <Field label="Current password" required error={errors.currentPassword?.message}>
            <Field.Input
              type="password"
              autoComplete="current-password"
              {...register('currentPassword')}
            />
          </Field>
          <Field
            label="New password"
            required
            hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
            error={errors.newPassword?.message}
          >
            <Field.Input type="password" autoComplete="new-password" {...register('newPassword')} />
          </Field>
          <Field label="Confirm new password" required error={errors.confirmPassword?.message}>
            <Field.Input
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
          </Field>
          <div>
            <Button type="submit" loading={status === 'submitting'}>
              {status === 'submitting' ? 'Updating' : 'Update Password'}
            </Button>
          </div>
        </>
      )}
    </Form>
  )
}
