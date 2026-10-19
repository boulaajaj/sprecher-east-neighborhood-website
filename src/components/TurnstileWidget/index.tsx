'use client'

import Script from 'next/script'
import React, { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Cloudflare Turnstile spam check in Managed mode: most visitors pass without doing
 * anything; Cloudflare shows a checkbox only when it isn't confident.
 * Docs: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
 */

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

type TurnstileRenderOptions = {
  sitekey: string
  action?: string
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
  /** Change this value to reset the widget (tokens are single use). */
  resetSignal?: number
  action?: string
}

export const TurnstileWidget: React.FC<Props> = ({ onToken, resetSignal = 0, action }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== 'undefined' && Boolean(window.turnstile),
  )
  const onTokenRef = useRef(onToken)
  useEffect(() => {
    onTokenRef.current = onToken
  }, [onToken])

  const renderWidget = useCallback(() => {
    const el = containerRef.current
    if (!el || !window.turnstile || widgetIdRef.current || !TURNSTILE_SITE_KEY) return
    widgetIdRef.current = window.turnstile.render(el, {
      sitekey: TURNSTILE_SITE_KEY,
      action,
      theme: 'auto',
      size: 'flexible',
      callback: (token) => onTokenRef.current(token),
      'expired-callback': () => onTokenRef.current(null),
      'error-callback': () => onTokenRef.current(null),
    })
  }, [action])

  useEffect(() => {
    if (scriptReady) renderWidget()
  }, [scriptReady, renderWidget])

  // Reset after each submission attempt so the next one gets a new token
  useEffect(() => {
    if (resetSignal === 0 || !widgetIdRef.current || !window.turnstile) return
    onTokenRef.current(null)
    window.turnstile.reset(widgetIdRef.current)
  }, [resetSignal])

  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current)
      widgetIdRef.current = null
    }
  }, [])

  if (!TURNSTILE_SITE_KEY) return null

  return (
    <>
      <Script src={SCRIPT_SRC} strategy="afterInteractive" onReady={() => setScriptReady(true)} />
      <div ref={containerRef} className="min-h-[65px] w-full" />
    </>
  )
}
