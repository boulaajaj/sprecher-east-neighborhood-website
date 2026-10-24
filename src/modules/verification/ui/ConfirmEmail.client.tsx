'use client'

import { MailCheck } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { Alert } from '@/platform/ui/Alert'
import { ConfirmedEmailContext } from '@/platform/ui/ConfirmedEmail.client'
import { Button, Link } from '@/platform/ui'

import { postConfirmation, type ConfirmAnswer } from './api'
import { isLinkDone, isSettled, toConfirmMessage } from './confirmMessages'

type Answer = ConfirmAnswer | 'offline'

/**
 * The confirm page's action: one button that confirms the email the link was sent to. Nothing
 * happens on page load, because mail scanners open links too. `token` is `null` when the link
 * has none, or one that can't be ours. `retryHref` is where a person with a dead link can ask
 * for a new one (the contact form). `children` shows once the email is confirmed (the account
 * offer, #187), and can read the confirmed address with `useConfirmedEmail`.
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
  const [sending, setSending] = useState(false)
  // Counts answers to clicks, so focus moves to the message after each one (not on page load)
  const [answers, setAnswers] = useState(0)
  const messageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // The button that had focus is gone or reset: put keyboard and screen reader users on the
    // answer instead of the top of the page
    if (answers > 0) messageRef.current?.focus()
  }, [answers])

  const confirm = async () => {
    if (!token || sending) return
    setSending(true)
    let next: Answer
    try {
      const reply = await postConfirmation(token)
      next = reply.answer
      setEmail(reply.email)
    } catch {
      next = 'offline'
    }
    // The link is done with: keep its token out of the address bar and the history
    if (isLinkDone(next)) window.history.replaceState(null, '', window.location.pathname)
    setAnswer(next)
    setSending(false)
    setAnswers((n) => n + 1)
  }

  const message = answer ? toConfirmMessage(answer) : null
  const settled = isSettled(answer)
  const canConfirm = token !== null && !isLinkDone(answer)

  return (
    <div className="space-y-6">
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
      {canConfirm && (
        <Button
          type="button"
          onClick={confirm}
          loading={sending}
          iconStart={<MailCheck aria-hidden />}
          fullWidth="mobile"
        >
          {sending ? 'Confirming' : 'Confirm my email'}
        </Button>
      )}
      {settled && <ConfirmedEmailContext value={email}>{children}</ConfirmedEmailContext>}
    </div>
  )
}
