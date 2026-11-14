// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PeriodNav, type PeriodNavProps } from './PeriodNav'
import { expectAccessible } from './testing/expectAccessible'

afterEach(cleanup)

const props = (over: Partial<PeriodNavProps> = {}): PeriodNavProps => ({
  title: 'October 2026',
  previousLabel: 'Earlier month',
  nextLabel: 'Later month',
  onPrevious: () => {},
  onNext: () => {},
  ...over,
})

describe('PeriodNav', () => {
  it('shows the title between two named buttons', () => {
    render(<PeriodNav {...props()} />)
    expect(screen.getByText('October 2026')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Earlier month' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Later month' })).toBeTruthy()
  })

  it('calls the matching handler for each button', () => {
    const onPrevious = vi.fn()
    const onNext = vi.fn()
    render(<PeriodNav {...props({ onPrevious, onNext })} />)
    fireEvent.click(screen.getByRole('button', { name: 'Earlier month' }))
    fireEvent.click(screen.getByRole('button', { name: 'Later month' }))
    expect(onPrevious).toHaveBeenCalledTimes(1)
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('disables a direction that cannot go on', () => {
    render(<PeriodNav {...props({ previousDisabled: true })} />)
    expect(
      (screen.getByRole('button', { name: 'Earlier month' }) as HTMLButtonElement).disabled,
    ).toBe(true)
    expect(
      (screen.getByRole('button', { name: 'Later month' }) as HTMLButtonElement).disabled,
    ).toBe(false)
  })

  it('announces a change of title politely', () => {
    render(<PeriodNav {...props()} />)
    expect(screen.getByText('October 2026').closest('[aria-live]')?.getAttribute('aria-live')).toBe(
      'polite',
    )
  })

  it('has no axe violations', async () => {
    const { container } = render(<PeriodNav {...props({ nextDisabled: true })} />)
    await expectAccessible(container)
  })
})
