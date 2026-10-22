import { describe, expect, it } from 'vitest'

import { toSubmitErrorMessage } from './submitErrorMessage'

describe('toSubmitErrorMessage', () => {
  it('says why when the visitor can act on it', () => {
    expect(toSubmitErrorMessage(429)).toMatch(/Too many messages/)
    expect(toSubmitErrorMessage(413)).toMatch(/too long/)
    expect(toSubmitErrorMessage(400)).toMatch(/reload the page/)
    expect(toSubmitErrorMessage(null)).toMatch(/connection/)
  })

  it('gives one fixed message for anything else, whatever the server said', () => {
    expect(toSubmitErrorMessage(500)).toBe(toSubmitErrorMessage(502))
    expect(toSubmitErrorMessage(500)).toMatch(/wasn’t sent/)
  })
})
