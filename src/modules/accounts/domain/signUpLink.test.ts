import { describe, expect, it } from 'vitest'

import { toSignUpHref } from './signUpLink'

describe('toSignUpHref', () => {
  it('fills in the email, encoded', () => {
    expect(toSignUpHref('ana+news@example.com')).toBe('/sign-up?email=ana%2Bnews%40example.com')
  })

  it('is the plain sign-up page without one', () => {
    expect(toSignUpHref(null)).toBe('/sign-up')
  })
})
