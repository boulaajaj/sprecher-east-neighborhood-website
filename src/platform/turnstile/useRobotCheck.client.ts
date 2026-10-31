'use client'

import { useCallback, useState } from 'react'

import { TURNSTILE_SITE_KEY } from './TurnstileWidget.client'

/** What a visitor reads when a form can't be sent yet because the robot check has no token. */
export const ROBOT_CHECK_MESSAGES = {
  blocked:
    'The spam check couldn’t load, so this form can’t be sent. A content blocker may be stopping it: allow challenges.cloudflare.com for this site, or try another browser.',
  failed: 'The spam check ran into a problem. Please reload the page and try again.',
  running:
    'One moment: the spam check is still running. If a checkbox appears above the button, tick it.',
} as const

/**
 * The state a form keeps for its `TurnstileWidget` (decision 0003), shared by the contact form
 * and sign-up. `enabled` is false when no site key is set: then there is no widget and no token.
 */
export function useRobotCheck() {
  const [token, setToken] = useState<string | null>(null)
  const [resetSignal, setResetSignal] = useState(0)
  const [blocked, setBlocked] = useState(false)
  const [failed, setFailed] = useState(false)

  const onToken = useCallback((next: string | null) => {
    setToken(next)
    if (next) {
      setFailed(false)
      setBlocked(false)
    }
  }, [])
  const onLoadError = useCallback(() => setBlocked(true), [])
  const onWidgetError = useCallback(() => setFailed(true), [])

  return {
    enabled: Boolean(TURNSTILE_SITE_KEY),
    token,
    /** Why the form can't be sent yet, or null when it can (a token, or the check is off). */
    pendingMessage: (): string | null => {
      if (!TURNSTILE_SITE_KEY || token) return null
      return ROBOT_CHECK_MESSAGES[blocked ? 'blocked' : failed ? 'failed' : 'running']
    },
    /** Tokens are single use: after an attempt, get a fresh one for the next. */
    renewToken: () => {
      if (TURNSTILE_SITE_KEY) setResetSignal((n) => n + 1)
    },
    widgetProps: { onToken, onLoadError, onWidgetError, resetSignal },
  }
}
