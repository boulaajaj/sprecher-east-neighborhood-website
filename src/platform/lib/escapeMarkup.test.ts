import { describe, expect, it } from 'vitest'

import { escapeMarkup } from './escapeMarkup'

describe('escapeMarkup', () => {
  it('escapes the five markup characters', () => {
    expect(escapeMarkup(`a&b<c>d"e'f`)).toBe('a&amp;b&lt;c&gt;d&quot;e&#39;f')
  })

  it('leaves other text alone', () => {
    expect(escapeMarkup('https://example.com/posts/fall-cleanup')).toBe(
      'https://example.com/posts/fall-cleanup',
    )
  })
})
