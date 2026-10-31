import { describe, expect, it } from 'vitest'

import { toSignInErrorMessage } from './signInErrorMessage'

describe('toSignInErrorMessage', () => {
  it('gives one message for a wrong password, an unknown email and a locked account', () => {
    expect(toSignInErrorMessage('wrong-credentials')).toBe(
      'Invalid email or password. Please try again.',
    )
  })

  it('tells a server failure and a lost connection apart from a wrong password', () => {
    expect(toSignInErrorMessage('server-error')).toBe(
      'Something went wrong on our side. Please try again in a few minutes.',
    )
    expect(toSignInErrorMessage('offline')).toMatch(/connection/)
  })
})
