'use client'

import { RotateCw } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { Alert } from '@/platform/ui/Alert'
import { ConfirmedEmailContext } from '@/platform/ui/ConfirmedEmail.client'
import { PendingStatus } from '@/platform/ui/PendingStatus'
import { Button, Link } from '@/platform/ui'

import { postConfirmation, type ConfirmAnswer } from './api'
import { isLinkDone, isSettled, toConfirmMessage } from './confirmMessages'

type Answer = ConfirmAnswer | 'offline'

/**
 * The confirm page's action: it confirms the email the link was sent to as soon as the page
 * loads, with no button to press (#300). The page's own script posts the token, so a scanner that
 * only fetches the link confirms nothing. A Try Again button shows only when the confirmation can
 * still work (too many tries, a server error, no connection). `token` is `null` when the link has
 * none, or one that can't be ours. `retryHref` is where a person with a dead link can ask for a
 * new one (the contact form). `children` shows once the email is confirmed (the account offer,
 * #187), and can read the confirmed address with `useConfirmedEmail`.
 */
export function ConfirmEmail({
  token,
  retryHref,
  children,
}: {
  token: string | null
  retryHref: string
  children?: React.ReactNode
}) {
  const [answer, setAnswer] = useState<Answer | null>(token ? null : 'invalid')
  const [email, setEmail] = useState<string | null>(null)
  const [sending, setSending] = useState(token !== null)
  // Counts answers to Try Again, so focus moves to the message after each one (not on page load)
  const [retries, setRetries] = useState(0)
  const messageRef = useRef<HTMLDivElement>(null)
  // React runs effects twice in development: confirm once per page load
  const started = useRef(false)

  const confirm = async (link: string) => {
    setSending(true)
    let next: Answer
    try {
      const reply = await postConfirmation(link)
      next = reply.answer
      setEmail(reply.email)
    } catch {
      next = 'offline'
    }
    // The link is done with: keep its token out of the address bar and the history
    if (isLinkDone(next)) window.history.replaceState(null, '', window.location.pathname)
    setAnswer(next)
    setSending(false)
  }

  useEffect(() => {
    if (!token || started.current) return
    started.current = true
    void confirm(token)
  }, [token])

  useEffect(() => {
    // The Try Again button is gone or reset: put keyboard and screen reader users on the answer
    if (retries > 0 && !sending) messageRef.current?.focus()
  }, [retries, sending])

  const retry = () => {
    if (!token || sending) return
    setRetries((n) => n + 1)
    void confirm(token)
  }

  const message = answer && !sending ? toConfirmMessage(answer) : null
  const settled = isSettled(answer)
  const canRetry = token !== null && answer !== null && !isLinkDone(answer)

  return (
    <div className="space-y-6">
      {sending && <PendingStatus>Confirming your email…</PendingStatus>}
      {message && (
        <div ref={messageRef} tabIndex={-1} className="space-y-3 outline-none">
          <Alert variant={message.variant}>{message.text}</Alert>
          {isLinkDone(answer) && !settled && (
            <Link href={retryHref} variant="action">
              Go to the contact form
            </Link>
          )}
        </div>
      )}
      {canRetry && !sending && (
        <Button
          type="button"
          variant="secondary"
          onClick={retry}
          iconStart={<RotateCw aria-hidden />}
          fullWidth="mobile"
        >
          Try Again
        </Button>
      )}
      {settled && <ConfirmedEmailContext value={email}>{children}</ConfirmedEmailContext>}
    </div>
  )
}
