import { describe, expect, it } from 'vitest'

import { toMapsHref } from './maps'

describe('toMapsHref', () => {
  it("uses the editor's map link when there is one", () => {
    expect(toMapsHref('https://maps.example/abc', '4605 Sprecher Rd')).toBe(
      'https://maps.example/abc',
    )
  })

  it('builds a Google Maps search for the address otherwise', () => {
    expect(toMapsHref(null, '4605 Sprecher Rd, Madison, WI 53718')).toBe(
      'https://www.google.com/maps/search/?api=1&query=4605%20Sprecher%20Rd%2C%20Madison%2C%20WI%2053718',
    )
  })

  it('has no link without a map link or an address', () => {
    expect(toMapsHref(null, null)).toBeNull()
    expect(toMapsHref('', '')).toBeNull()
  })
})
