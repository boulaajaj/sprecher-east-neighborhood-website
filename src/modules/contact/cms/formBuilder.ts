import type { PluginConfig } from '@payloadcms/plugin-form-builder/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { anyone } from '@/platform/payload/anyone'
import type { EmailConfirmer } from '@/platform/payload/emailConfirmer'
import { isAdmin, isAdminOrEditor, isAdminOrEditorFieldAccess } from '@/platform/payload/roles'

import { acknowledgeConfirmedSender } from './acknowledgeSender'
import { guardFormEmails } from './guardFormEmails'
import { limitSubmissionSize } from './limitSubmissionSize'
import { rateLimitSubmissions } from './rateLimits'
import { retentionHoldFields } from './retentionHold'
import { recordSenderEmail, requestSenderConfirmation, senderEmailFields } from './senderEmail'
import { TurnstileVerifier } from '@/platform/turnstile/turnstileVerifier'
import { verifyHumanSubmission } from './verifyHumanSubmission'

/**
 * The form-builder plugin's options: who may read and change forms and submissions, the
 * safeguards every public submission passes (size, rate limit, robot check, email rules), and
 * the sender's email confirmation (#183), through the confirmer `payload.config.ts` passes in.
 */
export const createFormBuilderOptions = ({
  emailConfirmer,
}: {
  emailConfirmer: EmailConfirmer
}): PluginConfig => ({
  beforeEmail: guardFormEmails,
  fields: {
    payment: false,
  },
  formOverrides: {
    access: {
      create: isAdminOrEditor,
      // Visitors must read a form's definition (fields, labels, submit button) to fill it
      // in. With admin/editor-only read, the public contact page rendered an empty form.
      read: anyone,
      update: isAdminOrEditor,
      delete: isAdmin,
    },
    fields: ({ defaultFields }) => {
      return defaultFields.map((field) => {
        // Email routing (recipients, reply-to, templates) stays private.
        if ('name' in field && field.name === 'emails' && field.type === 'array') {
          return {
            ...field,
            access: { ...field.access, read: isAdminOrEditorFieldAccess },
          }
        }
        if ('name' in field && field.name === 'confirmationMessage') {
          return {
            ...field,
            editor: lexicalEditor({
              features: ({ rootFeatures }) => {
                return [
                  ...rootFeatures,
                  FixedToolbarFeature(),
                  HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                ]
              },
            }),
          }
        }
        return field
      })
    },
  },
  formSubmissionOverrides: {
    hooks: {
      // Cheapest check first: oversized submissions never reach Turnstile or the database
      beforeValidate: [limitSubmissionSize],
      // Rate limit before Turnstile, so a rate-limited client never triggers a Siteverify call
      // Then who sent it: only a submission that passed the safeguards is looked up
      beforeChange: [
        rateLimitSubmissions,
        verifyHumanSubmission(new TurnstileVerifier()),
        recordSenderEmail(emailConfirmer),
      ],
      // After the plugin's own email step, which held an unconfirmed sender's emails: stores
      // them and asks the sender to confirm. The owner gets the message once they do (#274, #287).
      // A sender confirmed before gets the "we received your message" email instead (#274)
      afterChange: [requestSenderConfirmation(emailConfirmer), acknowledgeConfirmedSender],
    },
    fields: ({ defaultFields }) => [...defaultFields, ...senderEmailFields, ...retentionHoldFields],
    access: {
      create: () => true,
      read: isAdmin,
      update: isAdmin,
      delete: isAdmin,
    },
  },
})
