import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getRedirectTarget: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`)
  }),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))
vi.mock('../use-cases/getRedirectTarget', () => ({ getRedirectTarget: mocks.getRedirectTarget }))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect, notFound: mocks.notFound }))

import { PayloadRedirects } from './PayloadRedirects'

beforeEach(() => vi.clearAllMocks())

describe('PayloadRedirects', () => {
  it('sends the visitor to the redirect’s target', async () => {
    mocks.getRedirectTarget.mockResolvedValue('/new')

    await expect(PayloadRedirects({ url: '/old' })).rejects.toThrow('NEXT_REDIRECT /new')
    expect(mocks.getRedirectTarget).toHaveBeenCalledWith('/old')
  })

  it('answers 404 when no redirect applies', async () => {
    mocks.getRedirectTarget.mockResolvedValue(null)

    await expect(PayloadRedirects({ url: '/gone' })).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('draws nothing on a page that exists and has no redirect', async () => {
    mocks.getRedirectTarget.mockResolvedValue(null)

    expect(await PayloadRedirects({ url: '/about', disableNotFound: true })).toBeNull()
    expect(mocks.notFound).not.toHaveBeenCalled()
  })

  it('still follows a redirect set over a page that exists', async () => {
    mocks.getRedirectTarget.mockResolvedValue('/new')

    await expect(PayloadRedirects({ url: '/about', disableNotFound: true })).rejects.toThrow(
      'NEXT_REDIRECT /new',
    )
  })
})
