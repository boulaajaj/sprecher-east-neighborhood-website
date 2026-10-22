import { describe, expect, it } from 'vitest'

import type { RichTextValue } from '@/platform/lib'

import type { FaqEntry } from '../domain/types'
import { faqJsonLd } from './faqJsonLd'

const paragraph = (text: string): RichTextValue => ({
  root: {
    type: 'root',
    direction: null,
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        type: 'paragraph',
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        version: 1,
        children: [
          { type: 'text', text, version: 1, mode: 'normal', style: '', format: 0, detail: 0 },
        ],
      },
    ],
  },
})

const entries: FaqEntry[] = [
  { id: 2, question: 'How do I join?', answer: paragraph('Just show up.'), category: 'membership' },
  { id: 1, question: 'What is Sprecher East?', answer: paragraph('A neighborhood.') },
]

describe('faqJsonLd', () => {
  it('lists every question with its answer as plain text, in the order given', () => {
    expect(faqJsonLd(entries)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I join?',
          acceptedAnswer: { '@type': 'Answer', text: 'Just show up.' },
        },
        {
          '@type': 'Question',
          name: 'What is Sprecher East?',
          acceptedAnswer: { '@type': 'Answer', text: 'A neighborhood.' },
        },
      ],
    })
  })

  it('has no questions when there are no entries', () => {
    expect(faqJsonLd([])).toMatchObject({ '@type': 'FAQPage', mainEntity: [] })
  })
})
