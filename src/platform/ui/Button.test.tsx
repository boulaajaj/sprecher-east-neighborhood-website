// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Home } from 'lucide-react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Button } from './Button'
import { expectAccessible } from './testing/expectAccessible'

afterEach(cleanup)

describe('Button', () => {
  it('is a button that does not submit forms unless asked', () => {
    render(<Button>Save</Button>)

    expect(screen.getByRole('button', { name: 'Save' })).toHaveProperty('type', 'button')
  })

  it('submits when given type="submit"', async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
    render(
      <form onSubmit={(event) => onSubmit(event.nativeEvent as SubmitEvent)}>
        <Button type="submit">Send</Button>
      </form>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('renders a link when given href', () => {
    render(<Button href="/contact">Contact us</Button>)

    expect(screen.getByRole('link', { name: 'Contact us' }).getAttribute('href')).toBe('/contact')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('opens an external link in a new tab and says so', () => {
    render(
      <Button href="https://example.com/calendar" external>
        City calendar
      </Button>,
    )

    const link = screen.getByRole('link', { name: 'City calendar, opens in a new tab' })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('while loading, is busy and ignores clicks', async () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Sending
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Sending' })
    await userEvent.click(button)

    expect(button.getAttribute('aria-busy')).toBe('true')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('keeps its own classes after a caller adds one', () => {
    render(<Button className="mt-4">Save</Button>)

    expect(screen.getByRole('button').className).toContain('mt-4')
    expect(screen.getByRole('button').className).toContain('bg-primary-fill')
  })

  it('has no accessibility violations in any variant, as a button or a link', async () => {
    const { container } = render(
      <>
        {(['primary', 'secondary', 'accent', 'ghost', 'inverse', 'inverse-outline'] as const).map(
          (variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ),
        )}
        <Button size="icon" aria-label="Go home" iconStart={<Home aria-hidden="true" />} />
        <Button href="/" iconStart={<Home aria-hidden="true" />}>
          Go home
        </Button>
        <Button loading>Sending</Button>
      </>,
    )

    await expectAccessible(container)
  })
})
