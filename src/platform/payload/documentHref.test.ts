import { describe, expect, it } from 'vitest'

import { documentHref } from './documentHref'

describe('documentHref', () => {
  it('serves pages at the root and the home page at /', () => {
    expect(documentHref('pages', 'about')).toBe('/about')
    expect(documentHref('pages', 'home')).toBe('/')
  })

  it('serves every other collection under its own path', () => {
    expect(documentHref('posts', 'hello')).toBe('/posts/hello')
    expect(documentHref('events', 'potluck')).toBe('/events/potluck')
  })
})
