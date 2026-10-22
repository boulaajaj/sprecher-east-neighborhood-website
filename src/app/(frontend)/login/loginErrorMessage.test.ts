import { describe, expect, it } from 'vitest'

import { toLoginErrorMessage } from './loginErrorMessage'

describe('toLoginErrorMessage', () => {
  it('gives one message for a wrong password, an unknown email and a locked account', () => {
    const wrong = 'Invalid email or password. Please try again.'

    expect(toLoginErrorMessage(401)).toBe(wrong)
    expect(toLoginErrorMessage(400)).toBe(wrong)
    expect(toLoginErrorMessage(403)).toBe(wrong)
  })

  it('tells a server failure, a rate limit and a lost connection apart from a wrong password', () => {
    expect(toLoginErrorMessage(500)).toMatch(/on our side/)
    expect(toLoginErrorMessage(429)).toMatch(/Too many tries/)
    expect(toLoginErrorMessage(null)).toMatch(/connection/)
  })
})
