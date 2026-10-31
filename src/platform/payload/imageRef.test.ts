import { describe, expect, it } from 'vitest'

import type { Media } from '@/payload-types'

import { toImageRef } from './imageRef'

describe('toImageRef', () => {
  it('keeps an image that was loaded', () => {
    const image = { id: 4, alt: 'Park shelter', url: '/api/media/file/park.jpg' } as Media
    expect(toImageRef(image)).toBe(image)
  })

  it('has no image when the field holds only an id (not loaded)', () => {
    expect(toImageRef(4)).toBeNull()
  })

  it('has no image when the field is empty', () => {
    expect(toImageRef(null)).toBeNull()
    expect(toImageRef(undefined)).toBeNull()
  })
})
