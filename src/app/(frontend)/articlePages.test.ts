import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const here = path.dirname(fileURLToPath(import.meta.url))

// A post or event page looks the same in an editor's preview as it does to residents: no
// editor-only box (a "card preview") goes inside an article's layout (owner's rule, #532). Only
// the invisible live-refresh listener may depend on draft mode.
describe.each(['posts/[slug]/page.tsx', 'events/[slug]/page.tsx'])('%s', (file) => {
  const source = readFileSync(path.join(here, file), 'utf8')

  it('renders no preview box', () => {
    expect(source.replace(/LivePreviewListener/g, '')).not.toMatch(/preview/i)
  })

  it('uses draft mode only for the live-refresh listener', () => {
    const draftUses = source.match(/draft &&/g) ?? []
    expect(draftUses).toEqual(['draft &&'])
    expect(source).toContain('{draft && <LivePreviewListener />}')
  })
})
