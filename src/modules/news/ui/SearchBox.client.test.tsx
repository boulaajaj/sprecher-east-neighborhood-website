// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { expectAccessible } from '@/platform/ui/testing/expectAccessible'

// Next's router is the same object on every render
const { push, router } = vi.hoisted(() => {
  const push = vi.fn()
  return { push, router: { push } }
})
vi.mock('next/navigation', () => ({ useRouter: () => router }))

import { SearchBox } from './SearchBox.client'

beforeEach(() => {
  vi.useFakeTimers()
  push.mockClear()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const box = () => screen.getByRole('searchbox', { name: 'Search' }) as HTMLInputElement
const type = (text: string) => {
  fireEvent.change(box(), { target: { value: text } })
  act(() => vi.advanceTimersByTime(300))
}

describe('SearchBox (#200)', () => {
  it('keeps a shared search: it shows the query and doesn’t navigate away from it', () => {
    render(<SearchBox initialQuery="council" />)
    act(() => vi.advanceTimersByTime(1000))
    expect(box().value).toBe('council')
    expect(push).not.toHaveBeenCalled()
  })

  it('searches for what was typed, encoded', () => {
    render(<SearchBox />)
    type('a&b')
    expect(push).toHaveBeenCalledWith('/search?q=a%26b')
  })

  it('searches right away on Enter', () => {
    render(<SearchBox />)
    fireEvent.change(box(), { target: { value: 'park' } })
    fireEvent.submit(box())
    expect(push).toHaveBeenCalledWith('/search?q=park')
    // The pause still running when Enter was pressed doesn't search again
    act(() => vi.advanceTimersByTime(300))
    expect(push).toHaveBeenCalledTimes(1)
  })

  it('doesn’t navigate, or undo the typing, for a space between words', () => {
    const { rerender } = render(<SearchBox />)
    type('bike')
    // The page renders the search the box asked for
    rerender(<SearchBox initialQuery="bike" />)
    type('bike ')
    expect(push).toHaveBeenCalledTimes(1)
    expect(box().value).toBe('bike ')
  })

  it('shows the query of an address it didn’t make (back, forward, a link)', () => {
    const { rerender } = render(<SearchBox initialQuery="park" />)
    rerender(<SearchBox initialQuery="council" />)
    expect(box().value).toBe('council')
    act(() => vi.advanceTimersByTime(1000))
    expect(push).not.toHaveBeenCalled()
  })

  it('follows typing that brings back the previous query right after Back (Copilot, #349)', () => {
    const { rerender } = render(<SearchBox initialQuery="council" />)
    type('park')
    expect(push).toHaveBeenLastCalledWith('/search?q=park')
    rerender(<SearchBox initialQuery="park" />)
    // Back: the address shows council again
    rerender(<SearchBox initialQuery="council" />)
    expect(box().value).toBe('council')
    // Within the pause, the person types park again
    fireEvent.change(box(), { target: { value: 'park' } })
    act(() => vi.advanceTimersByTime(300))
    expect(push).toHaveBeenLastCalledWith('/search?q=park')
    expect(push).toHaveBeenCalledTimes(2)
  })

  it('is accessible', async () => {
    vi.useRealTimers()
    const { container } = render(<SearchBox initialQuery="council" />)
    await expectAccessible(container)
  })
})
