// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import type { RichTextValue } from '@/platform/lib'

import { RichText, type RichTextBlocks } from './RichText'

afterEach(cleanup)

const text = (value: string) => ({
  type: 'text',
  text: value,
  format: 0,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

const doc = (...children: Record<string, unknown>[]) =>
  ({
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children,
    },
  }) as unknown as RichTextValue

const paragraph = (...children: Record<string, unknown>[]) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  children,
})

const block = (fields: Record<string, unknown>) => ({
  type: 'block',
  format: '',
  version: 2,
  fields: { id: 'b1', blockName: '', ...fields },
})

const internalLink = (relationTo: string, slug: string, label: string) => ({
  type: 'link',
  format: '',
  indent: 0,
  version: 3,
  direction: 'ltr',
  fields: { linkType: 'internal', newTab: false, doc: { relationTo, value: { id: 1, slug } } },
  children: [text(label)],
})

describe('RichText', () => {
  it('renders the text of the document', () => {
    render(<RichText data={doc(paragraph(text('Welcome, neighbors')))} />)

    expect(screen.getByText('Welcome, neighbors').tagName).toBe('P')
  })

  it('renders a block with the renderer it is given for that block type', () => {
    const blocks: RichTextBlocks = {
      banner: ({ node }) => <aside>Banner: {node.fields.style}</aside>,
    }

    render(<RichText data={doc(block({ blockType: 'banner', style: 'info' }))} blocks={blocks} />)

    expect(screen.getByText('Banner: info')).toBeTruthy()
  })

  it('renders no block it has no renderer for', () => {
    const { container } = render(<RichText data={doc(block({ blockType: 'banner' }))} />)

    expect(container.querySelector('aside')).toBeNull()
    expect(container.textContent).not.toContain('Banner')
  })

  it('links to a post or a page by its address on the site', () => {
    render(
      <RichText
        data={doc(
          paragraph(
            internalLink('posts', 'park-cleanup', 'the cleanup'),
            text(' and '),
            internalLink('pages', 'about', 'about us'),
          ),
        )}
      />,
    )

    expect(screen.getByRole('link', { name: 'the cleanup' }).getAttribute('href')).toBe(
      '/posts/park-cleanup',
    )
    expect(screen.getByRole('link', { name: 'about us' }).getAttribute('href')).toBe('/about')
  })

  it('is a centred prose column by default, and full width without the gutter', () => {
    const { container, rerender } = render(<RichText data={doc(paragraph(text('a')))} />)
    const wrapper = () => container.firstElementChild?.className ?? ''

    expect(wrapper()).toContain('container')
    expect(wrapper()).toContain('prose')

    rerender(<RichText data={doc(paragraph(text('a')))} enableGutter={false} />)
    expect(wrapper()).not.toContain('container')
    expect(wrapper()).toContain('max-w-none')
  })
})
