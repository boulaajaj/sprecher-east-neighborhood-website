'use client'

import React, { useState } from 'react'
import { z } from 'zod'

import { Button, Field, Form, type FormApi, type FormStatus } from '@/platform/ui'

import { toPasswordErrorMessage } from './passwordErrorMessage'

const MIN_PASSWORD_LENGTH = 8

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`),
    confirmPassword: z.string().min(1, 'Type the new password again'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'The passwords don’t match',
    path: ['confirmPassword'],
  })

type Values = z.output<typeof passwordSchema>

export function ChangePasswordForm({ userId }: { userId: number }) {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Never the server's text (#204); Payload logs the details
  const fail = (httpStatus: number | null) => {
    setErrorMessage(toPasswordErrorMessage(httpStatus))
    setStatus('error')
  }

  const changePassword = async (values: Values, form: FormApi<Values, Values>) => {
    setStatus('submitting')
    let res: Response
    try {
      res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: values.newPassword }),
      })
    } catch {
      return fail(null)
    }
    if (!res.ok) return fail(res.status)

    form.reset()
    setStatus('success')
  }

  return (
    <Form
      aria-label="Change password"
      schema={passwordSchema}
      defaultValues={{ newPassword: '', confirmPassword: '' }}
      onSubmit={changePassword}
      status={status}
      successMessage="Password updated."
      errorMessage={errorMessage}
    >
      {({ register, formState: { errors } }) => (
        <>
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
