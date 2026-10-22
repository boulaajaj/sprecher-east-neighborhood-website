import { describe, expect, it } from 'vitest'

import { toPasswordErrorMessage } from './passwordErrorMessage'

describe('toPasswordErrorMessage', () => {
  it('asks to log in again when the session is gone', () => {
    expect(toPasswordErrorMessage('signed-out')).toBe(
      'Your session has ended. Log in again, then change your password.',
    )
  })

  it('says why when the resident can act on it', () => {
    expect(toPasswordErrorMessage('rejected')).toBe(
      'That password can’t be used. Choose a different one and try again.',
    )
    expect(toPasswordErrorMessage('offline')).toMatch(/connection/)
  })

  it('gives one fixed message for a failure on our side', () => {
    expect(toPasswordErrorMessage('server-error')).toBe(
      'We couldn’t update your password. Please try again in a few minutes.',
    )
  })
})
