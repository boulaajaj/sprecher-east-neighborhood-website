import { describe, expect, it } from 'vitest'

import type { RichTextValue } from '@/platform/lib'

import { richTextToPlainText } from './toPlainText'

const text = (value: string) => ({ type: 'text', text: value, version: 1 })
const paragraph = (...children: unknown[]) => ({ type: 'paragraph', version: 1, children })
const doc = (...children: unknown[]) =>
  ({ root: { type: 'root', version: 1, children } }) as unknown as RichTextValue

describe('richTextToPlainText', () => {
  it('keeps the words of a paragraph, links included, without markup', () => {
    const link = { type: 'link', version: 1, children: [text('the city site')] }
    expect(richTextToPlainText(doc(paragraph(text('See '), link, text('.'))))).toBe(
      'See the city site.',
    )
  })

  it('keeps line breaks, and separates paragraphs and list items', () => {
    const list = {
      type: 'list',
      version: 1,
      children: [
        { type: 'listitem', version: 1, children: [text('one')] },
        { type: 'listitem', version: 1, children: [text('two')] },
      ],
    }
    const lines = paragraph(text('A'), { type: 'linebreak', version: 1 }, text('B'))

    expect(richTextToPlainText(doc(lines, list))).toBe('A\nB\n\none\ntwo')
  })

  it('is empty for no rich text or an empty paragraph', () => {
    expect(richTextToPlainText(null)).toBe('')
    expect(richTextToPlainText(doc(paragraph()))).toBe('')
  })

  it('trims an empty paragraph and spaces at either end', () => {
    expect(richTextToPlainText(doc(paragraph(text('  A ')), paragraph()))).toBe('A')
  })
})
