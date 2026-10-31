// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import type { Header } from '@/payload-types'

import { HeaderNav } from './HeaderNav.client'

afterEach(cleanup)

const custom = (label: string, url: string) => ({
  link: { type: 'custom' as const, label, url },
})

const data: Header = {
  id: 1,
  navItems: [custom('Events', '/events'), custom('News', '/posts'), custom('Contact', '/contact')],
}

const linkNames = () => screen.getAllByRole('link').map((link) => link.textContent)

describe('HeaderNav', () => {
  it('shows the editors’ links, then Search', () => {
    render(<HeaderNav data={data} pathname="/" mobile />)

    expect(linkNames()).toEqual(['Events', 'News', 'Search'])
  })

  it('leaves out a Contact link, which the header shows as its own button', () => {
    render(<HeaderNav data={data} pathname="/" mobile />)

    expect(screen.queryByRole('link', { name: 'Contact' })).toBeNull()
  })

  it('marks the link for the section the visitor is in', () => {
    render(<HeaderNav data={data} pathname="/posts/park-cleanup" mobile />)

    expect(screen.getByRole('link', { name: 'News' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: 'Events' }).getAttribute('aria-current')).toBeNull()
  })
})
