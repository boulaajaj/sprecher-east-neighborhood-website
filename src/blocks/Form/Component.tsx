'use client'
import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useRef, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'
import { TURNSTILE_SITE_KEY, TurnstileWidget } from '@/components/TurnstileWidget'
import { TURNSTILE_TOKEN_HEADER } from '@/utilities/turnstileHeader'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: DefaultTypedEditorState
}

export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
  } = props

  const formMethods = useForm({
    defaultValues: formFromProps.fields,
  })
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
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
  // Blocks a double-click from sending a second request with the same single-use token
  const submittingRef = useRef(false)

  const onSubmit = useCallback(
    (data: FormFieldBlock[]) => {
      let loadingTimerID: ReturnType<typeof setTimeout>
      const submitForm = async () => {
        if (submittingRef.current) return
        setError(undefined)

        if (TURNSTILE_SITE_KEY && !turnstileToken) {
          setError({
            message: turnstileBlocked
              ? 'The spam check couldn’t load, so this form can’t be sent. A content blocker may be stopping it: allow challenges.cloudflare.com for this site, or try another browser.'
              : turnstileFailed
                ? 'The spam check ran into a problem. Please reload the page and try again.'
                : 'One moment: the spam check is still running. If a checkbox appears above the Send button, tick it.',
          })
          return
        }
        submittingRef.current = true
        let succeeded = false

        const dataToSend = Object.entries(data).map(([name, value]) => ({
          field: name,
          value,
        }))

        // delay loading indicator by 1s
        loadingTimerID = setTimeout(() => {
          setIsLoading(true)
        }, 1000)

        try {
          const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify({
              form: formID,
              submissionData: dataToSend,
            }),
            headers: {
              'Content-Type': 'application/json',
              ...(turnstileToken ? { [TURNSTILE_TOKEN_HEADER]: turnstileToken } : {}),
            },
            method: 'POST',
          })

          const res = await req.json()

          clearTimeout(loadingTimerID)

          if (req.status >= 400) {
            setIsLoading(false)

            setError({
              message: res.errors?.[0]?.message || 'Internal Server Error',
              status: res.status,
            })

            return
          }

          setIsLoading(false)
          setHasSubmitted(true)
          succeeded = true

          if (confirmationType === 'redirect' && redirect) {
            const { url } = redirect

            const redirectUrl = url

            if (redirectUrl) router.push(redirectUrl)
          }
        } catch (err) {
          console.warn(err)
          setIsLoading(false)
          setError({
            message: 'Something went wrong.',
          })
        } finally {
          submittingRef.current = false
          // Tokens are single use: after a failed attempt, get a fresh one for the retry
          if (TURNSTILE_SITE_KEY && !succeeded) setTurnstileReset((n) => n + 1)
        }
      }

      void submitForm()
    },
    [router, formID, redirect, confirmationType, turnstileToken, turnstileBlocked, turnstileFailed],
  )

  return (
    <div className="container py-10 md:py-14 lg:max-w-[48rem]">
      {enableIntro && introContent && !hasSubmitted && (
        <RichText className="mb-8 lg:mb-12" data={introContent} enableGutter={false} />
      )}
      <div className="rounded-[0.8rem] border border-border p-4 lg:p-6">
        <FormProvider {...formMethods}>
          {!isLoading && hasSubmitted && confirmationType === 'message' && (
            <RichText data={confirmationMessage} />
          )}
          {isLoading && !hasSubmitted && (
            <p className="animate-pulse text-sm text-muted-foreground">Loading, please wait...</p>
          )}
          {error && (
            <Alert variant="error">
              {error.message || 'Something went wrong. Please try again.'}
            </Alert>
          )}
          {!hasSubmitted && (
            <form id={formID} onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4 last:mb-0">
                {formFromProps &&
                  formFromProps.fields &&
                  formFromProps.fields?.map((field, index) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
                    if (Field) {
                      return (
                        <div className="mb-6 last:mb-0" key={index}>
                          <Field
                            form={formFromProps}
                            {...field}
                            {...formMethods}
                            control={control}
                            errors={errors}
                            register={register}
                          />
                        </div>
                      )
                    }
                    return null
                  })}
              </div>

              {TURNSTILE_SITE_KEY && (
                <div className="mb-6">
                  <TurnstileWidget
                    onToken={onTurnstileToken}
                    onLoadError={onTurnstileBlocked}
                    onWidgetError={onTurnstileError}
                    resetSignal={turnstileReset}
                  />
                </div>
              )}

              <Button
                className="min-h-11 w-full px-6 sm:w-auto"
                disabled={isLoading}
                form={formID}
                size="lg"
                type="submit"
                variant="default"
              >
                {submitButtonLabel || 'Send'}
              </Button>
            </form>
          )}
        </FormProvider>
      </div>
    </div>
  )
}
