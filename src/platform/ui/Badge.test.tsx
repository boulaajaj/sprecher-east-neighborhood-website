// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Badge, BadgeList } from './Badge'
import { expectAccessible } from './testing/expectAccessible'

afterEach(cleanup)

describe('Badge', () => {
  it('is a category pill by default, in text that passes on its tint (#418)', () => {
    render(<Badge>Meeting</Badge>)

    const badge = screen.getByText('Meeting')
    expect(badge.className).toContain('text-primary-strong')
    expect(badge.className).toContain('bg-primary/10')
  })

  it('sits on its own scrim over a photo', () => {
    render(<Badge variant="on-image">Meeting</Badge>)

    expect(screen.getByText('Meeting').className).toContain('text-on-image')
    expect(screen.getByText('Meeting').className).toContain('bg-scrim/40')
  })

  it('lines badges up in a row that wraps, with no accessibility violations', async () => {
    const { container } = render(
      <BadgeList>
        <Badge>Meeting</Badge>
        <Badge>Parks</Badge>
      </BadgeList>,
    )

    expect(container.firstElementChild?.className).toContain('flex-wrap')
    await expectAccessible(container)
  })
})
