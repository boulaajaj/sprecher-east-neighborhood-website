// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import { CallToActionBlock } from './CallToActionBlock'

afterEach(cleanup)

const node = (type: string, extra: Record<string, unknown>, children: unknown[] = []) => ({
  type,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  ...extra,
  children,
})

const text = (value: string) => ({
  type: 'text',
  text: value,
  format: 0,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

const richText = {
  root: node('root', {}, [
    node('paragraph', { textFormat: 0 }, [
      text('Read the '),
      node('link', { fields: { linkType: 'custom', url: '/faq', newTab: false } }, [text('FAQ')]),
    ]),
  ]),
} as unknown as CTABlockProps['richText']

describe('CallToActionBlock', () => {
  // The band is the brand green in both modes, so the theme's link colour (made for page
  // backgrounds) would fail contrast on it (#401)
  it('makes links in its text the band text colour', () => {
    render(<CallToActionBlock blockType="cta" richText={richText} links={[]} />)

    expect(screen.getByRole('link', { name: 'FAQ' }).closest('.prose')?.className).toContain(
      '[&_a]:text-primary-foreground',
    )
    // And the focus outline, as the theme's green outline is under 3:1 on the band
    expect(screen.getByRole('link', { name: 'FAQ' }).closest('.prose')?.className).toContain(
      '[&_a:focus-visible]:outline-primary-foreground',
    )
  })
})
