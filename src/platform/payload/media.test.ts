import path from 'path'
import { describe, expect, it } from 'vitest'

import { Media } from './media'

describe('Media', () => {
  it('stores uploads in public/media at the project root', () => {
    const upload = typeof Media.upload === 'object' ? Media.upload : undefined
    expect(upload?.staticDir).toBe(path.resolve(process.cwd(), 'public/media'))
  })
})
