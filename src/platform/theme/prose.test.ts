import { describe, expect, it } from 'vitest'

import config from '../../../tailwind.config.mjs'
import { THEME_TOKEN_NAMES } from './tokens'

// The rich-text colours (#225, #401): each must be a theme token, so posts and pages follow the
// site's theme and a new theme recolours them without touching the Tailwind config.
type ProseConfig = { DEFAULT: { css: Record<string, unknown>[] } }
const typography = config.theme?.extend?.typography as () => ProseConfig
const proseVariables = Object.entries(typography().DEFAULT.css[0]).filter(([name]) =>
  name.startsWith('--tw-prose-'),
)

const TOKEN = /^var\(--([\w-]+)\)$/
const TOKEN_TINT = /^color-mix\(in srgb, var\(--([\w-]+)\) \d+%, transparent\)$/

describe('rich-text colours', () => {
  it('sets every colour the typography plugin reads', () => {
    expect(proseVariables.map(([name]) => name).sort()).toEqual(
      [
        'body',
        'headings',
        'lead',
        'links',
        'bold',
        'counters',
        'bullets',
        'hr',
        'quotes',
        'quote-borders',
        'captions',
        'kbd',
        'kbd-shadows',
        'code',
        'pre-code',
        'pre-bg',
        'th-borders',
        'td-borders',
      ]
        .map((name) => `--tw-prose-${name}`)
        .sort(),
    )
  })

  it.each(proseVariables)('%s is a theme token', (_name, value) => {
    const token = TOKEN.exec(String(value))?.[1] ?? TOKEN_TINT.exec(String(value))?.[1]
    expect(THEME_TOKEN_NAMES).toContain(token)
  })

  it('needs no inverted colours, which follow the device and not the site', () => {
    expect(proseVariables.some(([name]) => name.startsWith('--tw-prose-invert-'))).toBe(false)
  })
})
