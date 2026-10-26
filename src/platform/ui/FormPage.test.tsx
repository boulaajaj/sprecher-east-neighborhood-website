// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { FormPage } from './FormPage'
import { PageHeader } from './PageHeader'
import { expectAccessible } from './testing/expectAccessible'

afterEach(cleanup)

describe('FormPage', () => {
  it('centres a narrow column for one form by default (#439)', async () => {
    const { container } = render(
      <main>
        <FormPage>
          <PageHeader variant="compact" title="Log In" />
          <p>The form</p>
        </FormPage>
      </main>,
    )

    const page = container.querySelector('main > div')
    expect(page?.className).toContain('items-center')
    expect(page?.firstElementChild?.className).toContain('max-w-md')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Log In')
    await expectAccessible(container)
  })

  it('starts a wider page of panels at the top', () => {
    const { container } = render(
      <FormPage width="lg" align="top">
        <p>Panels</p>
      </FormPage>,
    )

    expect(container.firstElementChild?.className).not.toContain('items-center')
    expect(container.firstElementChild?.firstElementChild?.className).toContain('max-w-lg')
  })
})
