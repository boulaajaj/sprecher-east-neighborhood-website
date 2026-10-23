'use client'

import { MailCheck } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { Alert } from '@/platform/ui/Alert'
import { Button } from '@/platform/ui'

import { verifyAccount } from '../actions'
import { SIGN_IN_PATH } from '../domain/paths'
import type { VerifyAccountFailure } from '../domain/types'
import { ACCOUNT_VERIFIED, toVerifyAccountErrorMessage } from './signUpMessages'

type Answer = 'verified' | VerifyAccountFailure | 'offline'

/**
 * The verify page's action (#187): one button that opens Payload's verification for the link's
 * token. Nothing happens on page load, because mail scanners open links too and would use it up.
 * `token` is `null` when the link has none, or one that can't be a token. The token leaves the
 * address bar and the history as soon as the page loads; the component keeps the one it was given.
 */
export function VerifyAccount({ token: linkToken }: { token: string | null }) {
  const [token] = useState(linkToken)
  const [answer, setAnswer] = useState<Answer | null>(token ? null : 'invalid-link')
  const [sending, setSending] = useState(false)
  // Counts answers to clicks, so focus moves to the message after each one (not on page load)
  const [answers, setAnswers] = useState(0)
  const messageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.location.search) window.history.replaceState(null, '', window.location.pathname)
  }, [])
  useEffect(() => {
    if (answers > 0) messageRef.current?.focus()
  }, [answers])

  const verify = async () => {
    if (!token || sending) return
    setSending(true)
    let next: Answer
    try {
      const result = await verifyAccount({ token })
      next = result.ok ? 'verified' : result.failure
    } catch {
      next = 'offline'
    }
    setAnswer(next)
    setSending(false)
    setAnswers((n) => n + 1)
  }

  // A verified account or a dead link: the next step is to log in
  const done = answer === 'verified' || answer === 'invalid-link'

  return (
    <div className="space-y-6">
      {answer && (
        <div ref={messageRef} tabIndex={-1} className="outline-none">
          {answer === 'verified' ? (
            <Alert variant="success">{ACCOUNT_VERIFIED}</Alert>
          ) : (
            <Alert variant="error">{toVerifyAccountErrorMessage(answer)}</Alert>
          )}
        </div>
      )}
      {done ? (
        <Button href={SIGN_IN_PATH} fullWidth>
          Log In
        </Button>
      ) : (
        <Button
          type="button"
          onClick={verify}
          loading={sending}
          iconStart={<MailCheck aria-hidden />}
          fullWidth
        >
          {sending ? 'Confirming' : 'Confirm My Account'}
        </Button>
      )}
    </div>
  )
}
