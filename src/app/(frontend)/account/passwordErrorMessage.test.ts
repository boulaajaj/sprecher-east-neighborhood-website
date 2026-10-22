import { describe, expect, it } from 'vitest'

import { toPasswordErrorMessage } from './passwordErrorMessage'

describe('toPasswordErrorMessage', () => {
  it('asks to log in again when the session is gone', () => {
    expect(toPasswordErrorMessage(401)).toMatch(/Log in again/)
    expect(toPasswordErrorMessage(403)).toBe(toPasswordErrorMessage(401))
  })

  it('says why when the resident can act on it', () => {
    expect(toPasswordErrorMessage(400)).toMatch(/Choose a different one/)
    expect(toPasswordErrorMessage(429)).toMatch(/Too many tries/)
    expect(toPasswordErrorMessage(null)).toMatch(/connection/)
  })

  it('gives one fixed message for anything else', () => {
    expect(toPasswordErrorMessage(500)).toBe(toPasswordErrorMessage(503))
    expect(toPasswordErrorMessage(500)).toMatch(/couldn’t update your password/)
  })
})
