import { describe, expect, it } from 'vitest'

import { toEmailHtml } from './emailLayout'

describe('toEmailHtml', () => {
  it('escapes the paragraphs and the button’s link and label', () => {
    const html = toEmailHtml(['<b>Hi</b> & welcome'], {
      label: 'Go "now"',
      href: 'https://example.com/?a=1&b="2"',
    })
    expect(html).toContain('&lt;b&gt;Hi&lt;/b&gt; &amp; welcome')
    expect(html).toContain('href="https://example.com/?a=1&amp;b=&quot;2&quot;"')
    expect(html).toContain('Go &quot;now&quot;')
    expect(html).not.toContain('<b>')
  })

  it('says the site is unofficial and AI-assisted', () => {
    expect(toEmailHtml([])).toContain('an unofficial, AI-assisted neighborhood website')
  })
})
