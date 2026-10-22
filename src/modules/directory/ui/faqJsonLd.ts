import { lexicalToPlainText } from '@/utilities/lexicalToPlainText'

import type { FaqEntry } from '../domain/types'

/** Structured data for the FAQ page (schema.org `FAQPage`), for search engines' rich results. */
export function faqJsonLd(entries: readonly FaqEntry[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: lexicalToPlainText(answer),
      },
    })),
  }
}
