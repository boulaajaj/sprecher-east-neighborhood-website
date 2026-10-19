'use client'

import Script from 'next/script'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useTheme } from '@/providers/Theme'
import { TURNSTILE_ACTION } from '@/utilities/turnstileHeader'

/**
 * Cloudflare Turnstile spam check, Managed mode with appearance "interaction-only": the check
 * runs invisibly and the widget only appears when Cloudflare wants the visitor to tick a box.
 * Docs: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
 */

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

/** 'flexible' has a 300px minimum width; narrower containers (320px phones) get 'compact'. */
const FLEXIBLE_MIN_WIDTH = 300

type TurnstileRenderOptions = {
  sitekey: string
  action?: string
  appearance?: 'always' | 'execute' | 'interaction-only'
  theme?: 'auto' | 'light' | 'dark'
  size?: 'normal' | 'flexible' | 'compact'
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

type TurnstileApi = {
  render: (element: HTMLElement, options: TurnstileRenderOptions) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

type Props = {
  /** Called with a fresh token, or null when the token expires or the check errors. */
  onToken: (token: string | null) => void
  /** Called when the Turnstile script can't load (blocked or offline). */
  onLoadError?: () => void
  /** Change this value to reset the widget (tokens are single use). */
  resetSignal?: number
}

export const TurnstileWidget: React.FC<Props> = ({ onToken, onLoadError, resetSignal = 0 }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const { theme } = useTheme()
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== 'undefined' && Boolean(window.turnstile),
  )
  const onTokenRef = useRef(onToken)
  useEffect(() => {
    onTokenRef.current = onToken
  }, [onToken])

  const removeWidget = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current)
    widgetIdRef.current = null
  }, [])

  // (Re)render when the script is ready and whenever the site theme changes
  useEffect(() => {
    const el = containerRef.current
    if (!scriptReady || !el || !window.turnstile || !TURNSTILE_SITE_KEY) return
    removeWidget()
    widgetIdRef.current = window.turnstile.render(el, {
      sitekey: TURNSTILE_SITE_KEY,
      action: TURNSTILE_ACTION,
      appearance: 'interaction-only',
      theme: theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : 'auto',
      size: el.clientWidth < FLEXIBLE_MIN_WIDTH ? 'compact' : 'flexible',
      callback: (token) => onTokenRef.current(token),
      'expired-callback': () => onTokenRef.current(null),
      'error-callback': () => onTokenRef.current(null),
    })
    onTokenRef.current(null)
    return removeWidget
  }, [scriptReady, theme, removeWidget])

  // Reset after a failed attempt so the next one gets a new token
  useEffect(() => {
    if (resetSignal === 0 || !widgetIdRef.current || !window.turnstile) return
    onTokenRef.current(null)
    window.turnstile.reset(widgetIdRef.current)
  }, [resetSignal])

  if (!TURNSTILE_SITE_KEY) return null

  return (
    <>
      <Script
        src={SCRIPT_SRC}
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => onLoadError?.()}
      />
      <div ref={containerRef} className="w-full max-w-full" />
    </>
  )
}
