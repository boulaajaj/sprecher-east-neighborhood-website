// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { DetailLayout } from './DetailLayout'
import { expectAccessible } from './testing/expectAccessible'

afterEach(cleanup)

describe('DetailLayout', () => {
  it('puts the content first and the sidebar in an aside (#434)', async () => {
    const { container } = render(
      <main>
        <DetailLayout aside={<p>Upcoming events</p>}>
          <p>The post</p>
        </DetailLayout>
      </main>,
    )

    const aside = screen.getByRole('complementary')
    expect(aside.textContent).toBe('Upcoming events')
    expect(container.querySelector('main > div')?.firstElementChild?.textContent).toBe('The post')
    await expectAccessible(container)
  })
})
