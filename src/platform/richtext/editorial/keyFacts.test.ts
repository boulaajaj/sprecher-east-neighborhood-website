import { describe, expect, it } from 'vitest'

import { toKeyFactsProps } from './keyFacts'

describe('toKeyFactsProps', () => {
  it('maps stored facts to plain props, with the source resolved', () => {
    expect(
      toKeyFactsProps({
        facts: [
          {
            value: ' 2040s ',
            label: ' earliest construction ',
            icon: 'date',
            certainty: 'estimate',
            linkLabel: 'City budget',
            linkUrl: 'https://example.com/budget',
          },
        ],
      }),
    ).toEqual({
      facts: [
        {
          value: '2040s',
          label: 'earliest construction',
          icon: 'date',
          certainty: 'estimate',
          source: {
            href: 'https://example.com/budget',
            label: 'City budget',
            external: true,
            appearance: 'default',
          },
        },
      ],
    })
  })

  it('needs a value and a label, and falls back to cautious defaults', () => {
    const { facts } = toKeyFactsProps({
      facts: [
        { value: '', label: 'total cost', icon: 'money', certainty: 'unknown' },
        { value: '?', label: 'total cost', icon: 'rocket' as never, certainty: 'sure' as never },
      ],
    })
    expect(facts).toEqual([
      { value: '?', label: 'total cost', icon: 'info', certainty: 'unknown', source: null },
    ])
  })
})
