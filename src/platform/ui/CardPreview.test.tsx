// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { CardPreview } from './CardPreview'
import { expectAccessible } from './testing/expectAccessible'

afterEach(cleanup)

describe('CardPreview', () => {
  it('is a named, accessible region that says only editors see it', async () => {
    const { container } = render(
      <CardPreview>
        <article>
          <h3>Fall potluck</h3>
        </article>
      </CardPreview>,
    )
    const region = screen.getByRole('complementary', { name: 'Card preview' })
    expect(region.textContent).toContain('Only editors see this box.')
    expect(region.contains(screen.getByRole('heading', { name: 'Fall potluck' }))).toBe(true)
    await expectAccessible(container)
  })
})
