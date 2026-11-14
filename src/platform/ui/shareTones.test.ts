import { describe, expect, it } from 'vitest'

import { SHARE_TONES } from './shareTones'

describe('SHARE_TONES', () => {
  it('draws the highlighted slice in the primary green, solid, with a line of the same color', () => {
    expect(SHARE_TONES.highlight.fill).toBe('fill-primary-fill')
    expect(SHARE_TONES.highlight.edge).toBe('border-primary-fill')
  })

  it('draws the other slices in neutral tones of three different lightness', () => {
    const fills = [SHARE_TONES.strong, SHARE_TONES.medium, SHARE_TONES.light].map((t) => t.fill)
    expect(new Set(fills).size).toBe(3)
    for (const fill of fills) expect(fill).toContain('muted-foreground')
  })

  it('gives every tone a line the same color as its fill, so a nested row is told by color and place', () => {
    for (const tone of Object.values(SHARE_TONES)) {
      expect(tone.edge).toBe(tone.fill.replace(/^fill-/, 'border-'))
    }
  })
})
