'use client'

import { MailCheck } from 'lucide-react'
import React, { useState } from 'react'

import { Alert } from '@/platform/ui/Alert'
import { Button } from '@/platform/ui'

import { postConfirmation, type ConfirmAnswer } from './api'
import { isSettled, toConfirmMessage } from './confirmMessages'

type Answer = ConfirmAnswer | 'offline'

/**
 * The confirm page's action: one button that confirms the email the link was sent to. Nothing
 * happens on page load, because mail scanners open links too. `token` is `null` when the link
 * has none, or one that can't be ours. `children` shows once the email is confirmed (the account
 * offer, #187, will go there).
 */
export function ConfirmEmail({
  token,
  children,
}: {
  token: string | null
  children?: React.ReactNode
}) {
  const [answer, setAnswer] = useState<Answer | null>(token ? null : 'invalid')
  const [sending, setSending] = useState(false)

  const confirm = async () => {
    if (!token || sending) return
    setSending(true)
    try {
      setAnswer(await postConfirmation(token))
    } catch {
      setAnswer('offline')
    } finally {
      setSending(false)
    }
  }

  const message = answer ? toConfirmMessage(answer) : null
  const settled = isSettled(answer)
  const canConfirm = token !== null && !settled && answer !== 'expired' && answer !== 'invalid'

  return (
    <div className="space-y-6">
      {message && <Alert variant={message.variant}>{message.text}</Alert>}
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
      {settled && children}
    </div>
  )
}
