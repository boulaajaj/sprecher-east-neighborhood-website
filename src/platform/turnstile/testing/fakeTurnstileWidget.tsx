import { useEffect } from 'react'

// For component tests of forms with the robot check: replace the widget module with this one,
//
//   vi.mock('@/platform/turnstile/TurnstileWidget.client', () =>
//     import('@/platform/turnstile/testing/fakeTurnstileWidget'),
//   )
//
// The check is on, and the widget hands out `token-<n>` after its n-th reset, unless a test sets
// `fakeTurnstile.tokenFor` (to `() => null` for a check that never finishes).

export const fakeTurnstile = {
  tokenFor: (reset: number): string | null => `token-${reset}`,
}

export const TURNSTILE_SITE_KEY = 'test-site-key'

export function TurnstileWidget({
  onToken,
  resetSignal = 0,
}: {
  onToken: (token: string | null) => void
  resetSignal?: number
}) {
  useEffect(() => onToken(fakeTurnstile.tokenFor(resetSignal)), [onToken, resetSignal])
  return null
}
