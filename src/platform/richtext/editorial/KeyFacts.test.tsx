// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { expectAccessible } from '@/platform/ui/testing/expectAccessible'

import { KeyFacts } from './KeyFacts'
import type { KeyFact } from './keyFacts'

afterEach(cleanup)

const FACTS: KeyFact[] = [
  {
    value: '2040s',
    label: 'earliest construction',
    icon: 'date',
    certainty: 'estimate',
    source: null,
  },
  { value: '?', label: 'total cost', icon: 'money', certainty: 'unknown', source: null },
  {
    value: 'None',
    label: 'tax increase verified',
    icon: 'taxes',
    certainty: 'confirmed',
    source: {
      href: 'https://example.com',
      label: 'City budget',
      external: true,
      appearance: 'default',
    },
  },
]

describe('KeyFacts', () => {
  it('shows each fact with its label, value and certainty in words', async () => {
    const { container } = render(<KeyFacts facts={FACTS} />)

    const items = within(screen.getAllByRole('list')[0]).getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(within(items[0]).getByText('2040s')).toBeTruthy()
    expect(within(items[0]).getByText('earliest construction')).toBeTruthy()
    expect(within(items[0]).getByText('Estimate')).toBeTruthy()
    expect(within(items[1]).getByText('Unknown')).toBeTruthy()
    expect(within(items[2]).getByText('Confirmed')).toBeTruthy()
    expect(within(items[2]).getByRole('link', { name: /City budget/ })).toBeTruthy()
    await expectAccessible(container)
  })

  it('puts exactly three facts three across from sm, two or four in two columns', () => {
    const { container, rerender } = render(<KeyFacts facts={FACTS} />)
    expect(container.querySelector('ul')?.className).toContain('sm:grid-cols-3')
    expect(container.querySelector('ul')?.getAttribute('role')).toBe('list')

    rerender(<KeyFacts facts={FACTS.slice(0, 2)} />)
    expect(container.querySelector('ul')?.className).not.toMatch(/grid-cols-3/)
  })

  it('renders nothing without facts', () => {
    const { container } = render(<KeyFacts facts={[]} />)
    expect(container.innerHTML).toBe('')
  })
})
