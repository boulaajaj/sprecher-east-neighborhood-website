'use client'
import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useMemo, useState } from 'react'
import RichText from '@/components/RichText'
import { Button, Form, type FormStatus } from '@/platform/ui'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { postFormSubmission } from './api'
import { FormBuilderField, type FormValues } from './FormBuilderField.client'
import { toDefaultValues, toFormSchema } from './formSchema'
import { toSubmitErrorMessage } from './submitErrorMessage'
import { TURNSTILE_SITE_KEY, TurnstileWidget } from './TurnstileWidget.client'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: DefaultTypedEditorState
}

const TURNSTILE_MESSAGES = {
  blocked:
    'The spam check couldn’t load, so this form can’t be sent. A content blocker may be stopping it: allow challenges.cloudflare.com for this site, or try another browser.',
  failed: 'The spam check ran into a problem. Please reload the page and try again.',
  running:
    'One moment: the spam check is still running. If a checkbox appears above the Send button, tick it.',
}

export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: {
      id: formID,
      confirmationMessage,
      confirmationType,
      fields = [],
      redirect,
      submitButtonLabel,
    } = {},
    introContent,
  } = props

  const schema = useMemo(() => toFormSchema(fields), [fields])
  const defaultValues = useMemo(() => toDefaultValues(fields), [fields])
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()
  // Spam check (Cloudflare Turnstile) — only when a site key is configured
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileReset, setTurnstileReset] = useState(0)
  const [turnstileBlocked, setTurnstileBlocked] = useState(false)
  const [turnstileFailed, setTurnstileFailed] = useState(false)
  const onTurnstileToken = useCallback((token: string | null) => {
    setTurnstileToken(token)
    if (token) {
      setTurnstileFailed(false)
      setTurnstileBlocked(false)
    }
  }, [])
  const onTurnstileBlocked = useCallback(() => setTurnstileBlocked(true), [])
  const onTurnstileError = useCallback(() => setTurnstileFailed(true), [])

  const fail = (message: string) => {
    setErrorMessage(message)
    setStatus('error')
  }

  // `Form` ignores a second submit while this runs, so one single-use token is sent once
  const onSubmit = async (values: FormValues) => {
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      fail(
        TURNSTILE_MESSAGES[turnstileBlocked ? 'blocked' : turnstileFailed ? 'failed' : 'running'],
      )
      return
    }
    setStatus('submitting')
    let succeeded = false
    try {
      const response = await postFormSubmission(formID, values, turnstileToken)
      // The server's own message stays out of the page (#204); the server logs it
      if (!response.ok) {
        fail(toSubmitErrorMessage(response.status))
        return
      }
      succeeded = true
      setStatus('success')
      if (confirmationType === 'redirect' && redirect?.url) router.push(redirect.url)
    } catch {
      fail(toSubmitErrorMessage(null))
    } finally {
      // Tokens are single use: after a failed attempt, get a fresh one for the retry
      if (TURNSTILE_SITE_KEY && !succeeded) setTurnstileReset((n) => n + 1)
    }
  }

  const sent = status === 'success'

  return (
    <div className="container py-10 md:py-14 lg:max-w-[48rem]">
      {enableIntro && introContent && !sent && (
        <RichText className="mb-8 lg:mb-12" data={introContent} enableGutter={false} />
      )}
      <div className="rounded-[0.8rem] border border-border p-4 lg:p-6">
        <Form
          id={formID}
          aria-label={formFromProps.title || 'Form'}
          schema={schema}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          status={status}
          successMessage={
            confirmationType === 'message' && confirmationMessage ? (
              <RichText data={confirmationMessage} enableGutter={false} enableProse={false} />
            ) : undefined
          }
          errorMessage={errorMessage}
        >
          {/* Once sent, only the confirmation is left */}
          {(form) =>
            !sent && (
              <>
                {fields.map((field, index) => (
                  <FormBuilderField key={index} field={field} form={form} />
                ))}
                <div className="flex flex-col gap-6">
                  {TURNSTILE_SITE_KEY && (
                    <TurnstileWidget
                      onToken={onTurnstileToken}
                      onLoadError={onTurnstileBlocked}
                      onWidgetError={onTurnstileError}
                      resetSignal={turnstileReset}
                    />
                  )}
                  <div>
                    <Button
                      fullWidth="mobile"
                      loading={status === 'submitting'}
                      size="lg"
                      type="submit"
                    >
                      {status === 'submitting' ? 'Sending' : submitButtonLabel || 'Send'}
                    </Button>
                  </div>
                </div>
              </>
            )
          }
        </Form>
      </div>
    </div>
  )
}
