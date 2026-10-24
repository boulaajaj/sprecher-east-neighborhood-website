'use client'

import { RotateCw } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { Alert } from '@/platform/ui/Alert'
import { PendingStatus } from '@/platform/ui/PendingStatus'
import { Button, Form } from '@/platform/ui'

import { verifyAccount } from '../actions'
import { newPasswordSchema, type NewPasswordValues } from '../domain/credentials'
import { SIGN_IN_PATH } from '../domain/paths'
import type { VerifyAccountFailure } from '../domain/types'
import { NewPasswordFields } from './NewPasswordFields.client'
import {
  ACCOUNT_VERIFIED,
  CHOOSE_PASSWORD_TO_VERIFY,
  toVerifyAccountErrorMessage,
} from './signUpMessages'

type Answer = 'verified' | VerifyAccountFailure | 'offline'

/**
 * The verify page's action (#187): it opens Payload's verification for the link's token as soon
 * as the page loads, with no button to press (#300). The page's own script sends it, so a scanner
 * that only fetches the link verifies nothing. `token` is `null` when the link has none, or one
 * that can't be a token. The token leaves the address bar and the history as soon as the page
 * loads; the component keeps the one it was given. After a server error or no connection, a Try
 * Again button sends it again.
 *
 * A link resent after a second sign-up answers `needs-password` (#289): the person chooses the
 * account's password here, and the same request then verifies the email.
 */
export function VerifyAccount({ token: linkToken }: { token: string | null }) {
  const [token] = useState(linkToken)
  const [answer, setAnswer] = useState<Answer | null>(token ? null : 'invalid-link')
  const [sending, setSending] = useState(token !== null)
  // Once a password is asked for, the form stays until the account is verified
  const [choosingPassword, setChoosingPassword] = useState(false)
  // Counts answers to the person's own requests, so focus moves to the message after each one
  // (not on page load)
  const [requests, setRequests] = useState(0)
  const messageRef = useRef<HTMLDivElement>(null)
  // React runs effects twice in development: verify once per page load
  const started = useRef(false)
  // An answer that comes back after the person left the page changes nothing
  const mounted = useRef(true)

  const send = async (link: string, password?: NewPasswordValues) => {
    setSending(true)
    let next: Answer
    try {
      const result = await verifyAccount({ token: link, ...password })
      next = result.ok ? 'verified' : result.failure
    } catch {
      next = 'offline'
    }
    if (!mounted.current) return
    if (next === 'needs-password') setChoosingPassword(true)
    setAnswer(next)
    setSending(false)
  }

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  useEffect(() => {
    if (window.location.search) window.history.replaceState(null, '', window.location.pathname)
    if (!token || started.current) return
    started.current = true
    void send(token)
  }, [token])
  useEffect(() => {
    if (requests > 0 && !sending) messageRef.current?.focus()
  }, [requests, sending])

  const verify = async (password?: NewPasswordValues) => {
    if (!token || sending) return
    setRequests((n) => n + 1)
    await send(token, password)
  }

  // A verified account or a dead link: the next step is to log in
  const done = answer === 'verified' || answer === 'invalid-link'
  // Shown while the page-load request runs; the password form shows its own progress
  const confirmingOnLoad = sending && !choosingPassword

  return (
    <div className="space-y-6">
      {/* One live region from the first render, so the answer that replaces "Confirming" is
          announced; an error keeps its own alert */}
      <div ref={messageRef} tabIndex={-1} role="status" aria-live="polite" className="outline-none">
        {confirmingOnLoad ? (
          <>
            <PendingStatus>Confirming your account…</PendingStatus>
            <noscript>
              <p className="mt-3 text-foreground">
                Confirming needs JavaScript. Turn it on, then open the link again.
              </p>
            </noscript>
          </>
        ) : answer === 'verified' ? (
          <Alert variant="success" quiet>
            {ACCOUNT_VERIFIED}
          </Alert>
        ) : answer === 'needs-password' ? (
          <p className="text-foreground">{CHOOSE_PASSWORD_TO_VERIFY}</p>
        ) : (
          answer && <Alert variant="error">{toVerifyAccountErrorMessage(answer)}</Alert>
        )}
      </div>
      {done ? (
        <Button href={SIGN_IN_PATH} fullWidth>
          Log In
        </Button>
      ) : choosingPassword ? (
        <Form<NewPasswordValues, NewPasswordValues>
          aria-label="Choose your password"
          schema={newPasswordSchema}
          defaultValues={{}}
          onSubmit={verify}
          status={sending ? 'submitting' : 'idle'}
        >
          {({ register, formState: { errors } }) => (
            <>
              <NewPasswordFields
                label="Password"
                password={register('newPassword')}
                confirm={register('confirmPassword')}
                passwordError={errors.newPassword?.message}
                confirmError={errors.confirmPassword?.message}
              />
              <div>
                <Button type="submit" loading={sending} fullWidth>
                  {sending ? 'Confirming' : 'Set Password and Confirm'}
                </Button>
              </div>
            </>
          )}
        </Form>
      ) : (
        answer &&
        !sending && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => verify()}
            iconStart={<RotateCw aria-hidden />}
            fullWidth
          >
            Try Again
          </Button>
        )
      )}
    </div>
  )
}
