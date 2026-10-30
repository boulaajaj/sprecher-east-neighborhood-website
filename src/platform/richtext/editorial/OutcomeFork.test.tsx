// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { expectAccessible } from '@/platform/ui/testing/expectAccessible'

import { OutcomeFork } from './OutcomeFork'

afterEach(cleanup)

describe('OutcomeFork', () => {
  it('shows the question as a heading and each outcome in a list', async () => {
    const { container } = render(
      <OutcomeFork
        question="Will the City and State agree on cost?"
        outcomes={[
          { title: 'If they agree', tone: 'go', description: 'Design, land, contracts.' },
          { title: 'If they don’t', tone: 'stop', description: 'No new interchange.' },
          { title: 'If it stalls', tone: 'open', description: null },
        ]}
      />,
    )

    expect(screen.getByRole('heading').textContent).toBe('Will the City and State agree on cost?')
    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual([
      'If they agreeDesign, land, contracts.',
      'If they don’tNo new interchange.',
      'If it stalls',
    ])
    expect(screen.getByRole('list').className).toContain('sm:grid-cols-3')
    await expectAccessible(container)
  })

  it('renders nothing with fewer than two outcomes', () => {
    const { container } = render(
      <OutcomeFork question="Q?" outcomes={[{ title: 'A', tone: 'go', description: null }]} />,
    )
    expect(container.innerHTML).toBe('')
  })
})
