import type { Metadata } from 'next'
import { describe, expect, it, vi } from 'vitest'

import { ACCOUNT_PAGE_PATHS } from '@/modules/accounts'
import { CONFIRM_EMAIL_PATH } from '@/modules/verification'
import { NOT_INDEXED } from '@/platform/seo/notIndexed'

// The modules' components are replaced: this checks only what each page asks of search engines
const stub = () => null
vi.mock('@/modules/accounts/server', () => ({
  AccountOffer: stub,
  ChangePasswordForm: stub,
  ForgotPasswordForm: stub,
  getCurrentUser: vi.fn(),
  requireUser: vi.fn(),
  ResetPasswordForm: stub,
  SignInForm: stub,
  SignUpForm: stub,
  VerifyAccount: stub,
}))
vi.mock('@/modules/verification/server', () => ({ ConfirmEmail: stub }))

// Each page's module, by its path (Vitest needs the import paths written out)
const PAGES: Record<string, () => Promise<{ metadata: Metadata }>> = {
  '/login': () => import('./login/page'),
  '/account': () => import('./account/page'),
  '/forgot-password': () => import('./forgot-password/page'),
  '/reset-password': () => import('./reset-password/page'),
  '/sign-up': () => import('./sign-up/page'),
  '/verify-account': () => import('./verify-account/page'),
  '/confirm-email': () => import('./confirm-email/page'),
}

describe('pages kept out of search results (#280)', () => {
  it('covers every sign-in, account and confirmation page', () => {
    expect(Object.keys(PAGES).sort()).toEqual([...ACCOUNT_PAGE_PATHS, CONFIRM_EMAIL_PATH].sort())
  })

  it.each(Object.entries(PAGES))('%s asks not to be indexed or followed', async (_, load) => {
    const { metadata } = await load()
    expect(metadata.robots).toEqual(NOT_INDEXED)
    expect(NOT_INDEXED).toEqual({ index: false, follow: false })
  })
})
