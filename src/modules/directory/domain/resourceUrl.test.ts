import { describe, expect, it } from 'vitest'

import { isResourceUrl } from './resourceUrl'

describe('isResourceUrl', () => {
  it('accepts web addresses', () => {
    expect(isResourceUrl('https://www.cityofmadison.com')).toBe(true)
    expect(isResourceUrl('http://example.com/page')).toBe(true)
  })

  it('refuses anything that is not a web address', () => {
    expect(isResourceUrl('www.cityofmadison.com')).toBe(false)
    expect(isResourceUrl('javascript:alert(1)')).toBe(false)
    expect(isResourceUrl('mailto:someone@example.com')).toBe(false)
    expect(isResourceUrl(' https://example.com')).toBe(false)
  })
})
