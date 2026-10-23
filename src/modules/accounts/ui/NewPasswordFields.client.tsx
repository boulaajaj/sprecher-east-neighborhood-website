'use client'

import React from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

import { Field } from '@/platform/ui'

import { MIN_PASSWORD_LENGTH } from '../domain/credentials'

type Props = {
  /** `register('newPassword')` and `register('confirmPassword')` from the form */
  password: UseFormRegisterReturn
  confirm: UseFormRegisterReturn
  passwordError?: string
  confirmError?: string
  /** "Password" when the account is new; "New password" (the default) when it replaces one */
  label?: string
}

/**
 * The new password and its confirmation, with the length hint, as every account form asks for
 * them: sign-up, reset, change, and choosing one on the verify page (#289).
 */
export function NewPasswordFields({
  password,
  confirm,
  passwordError,
  confirmError,
  label = 'New password',
}: Props) {
  return (
    <>
      <Field
        label={label}
        required
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        error={passwordError}
      >
        <Field.Input type="password" autoComplete="new-password" {...password} />
      </Field>
      <Field label={`Confirm ${label.toLowerCase()}`} required error={confirmError}>
        <Field.Input type="password" autoComplete="new-password" {...confirm} />
      </Field>
    </>
  )
}
