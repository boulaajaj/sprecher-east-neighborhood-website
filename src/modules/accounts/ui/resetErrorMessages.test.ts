import { describe, expect, it } from 'vitest'

import { FORM_MESSAGES } from '@/platform/ui'

import { toForgotPasswordErrorMessage, toResetPasswordErrorMessage } from './resetErrorMessages'

describe('toForgotPasswordErrorMessage', () => {
  it('says the site couldn’t be reached, or asks to check the address', () => {
    expect(toForgotPasswordErrorMessage('offline')).toBe(FORM_MESSAGES.offline)
    expect(toForgotPasswordErrorMessage('rejected')).toBe('Check the email address and try again.')
  })
})

describe('toResetPasswordErrorMessage', () => {
  it('has a fixed text for each failure, none from the server', () => {
    expect(toResetPasswordErrorMessage('invalid-link')).toMatch(/expired or was already used/)
    expect(toResetPasswordErrorMessage('rejected')).toMatch(/can’t be used/)
    expect(toResetPasswordErrorMessage('server-error')).toMatch(/couldn’t set your password/)
    expect(toResetPasswordErrorMessage('offline')).toBe(FORM_MESSAGES.offline)
  })
})
