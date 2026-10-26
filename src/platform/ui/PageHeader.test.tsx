// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { PageHeader } from './PageHeader'
import { expectAccessible } from './testing/expectAccessible'

afterEach(cleanup)

describe('PageHeader', () => {
  it("draws the page's one h1 with its eyebrow and description, with no accessibility violations", async () => {
    const { container } = render(
      <main>
        <PageHeader
          eyebrow="Directory"
          title="Neighborhood Resources"
          description="Helpful contacts for residents."
        />
      </main>,
    )

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Neighborhood Resources')
    expect(screen.getByText('Directory').className).toContain('uppercase')
    expect(screen.getByText('Helpful contacts for residents.').className).toContain('max-w-2xl')
    await expectAccessible(container)
  })

  it('leaves out what it is not given', () => {
    const { container } = render(<PageHeader title="Search" />)

    expect(container.querySelectorAll('p')).toHaveLength(0)
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('offers a way back and holds a control under the title', () => {
    render(
      <PageHeader title="Past Events" backLink={{ href: '/events', label: 'Back to all events' }}>
        <input aria-label="Search" />
      </PageHeader>,
    )

    expect(screen.getByRole('link', { name: 'Back to all events' }).getAttribute('href')).toBe(
      '/events',
    )
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeTruthy()
  })

  it('draws a compact header for a form page, with no container of its own (#439)', () => {
    const { container } = render(
      <PageHeader variant="compact" title="Log In" description="Log in to your account." />,
    )

    const header = container.querySelector('header')
    expect(header?.className).not.toContain('container')
    expect(screen.getByRole('heading', { level: 1 }).className).toContain('text-3xl')
    expect(header?.className).toContain('mb-8')
  })
})
