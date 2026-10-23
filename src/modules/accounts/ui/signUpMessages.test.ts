import { describe, expect, it } from 'vitest'

import { FORM_MESSAGES } from '@/platform/ui'

import { SIGN_UP_SENT, toSignUpErrorMessage, toVerifyAccountErrorMessage } from './signUpMessages'

describe('sign-up messages', () => {
  it('never says whether an account already uses the email', () => {
    expect(SIGN_UP_SENT).toMatch(/^Check your email\. If the address can have a new account/)
    // The same resend hint for everyone (#289), from the cap itself
    expect(SIGN_UP_SENT).toMatch(/sign up again to get a new link\. After 3 tries, wait 3 hours\.$/)
  })

  it('has fixed texts for every failure', () => {
    expect(toSignUpErrorMessage('rejected')).toBe('Check the form and try again.')
    expect(toSignUpErrorMessage('offline')).toBe(FORM_MESSAGES.offline)
    expect(toSignUpErrorMessage('robot-check')).toMatch(/spam check/)
    expect(toSignUpErrorMessage('too-many')).toMatch(/try again in an hour/)
    expect(toVerifyAccountErrorMessage('invalid-link')).toMatch(/already used/)
    expect(toVerifyAccountErrorMessage('server-error')).toMatch(/try again/)
    expect(toVerifyAccountErrorMessage('offline')).toBe(FORM_MESSAGES.offline)
  })
})
