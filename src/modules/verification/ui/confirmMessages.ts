import { FORM_MESSAGES } from '@/platform/ui'

import type { ConfirmAnswer } from './api'

/** How a message is shown: a success (status) or a problem (alert). */
export type ConfirmMessage = { variant: 'success' | 'error'; text: string }

const MESSAGES: Record<ConfirmAnswer | 'offline', ConfirmMessage> = {
  confirmed: {
    variant: 'success',
    text: 'Thanks, your email is confirmed. A welcome email is on its way.',
  },
  'already-confirmed': {
    variant: 'success',
    text: 'This email is already confirmed. There’s nothing more to do.',
  },
  expired: {
    variant: 'error',
    text: 'This link has expired. Links work for 24 hours: send the form again to get a new one.',
  },
  invalid: {
    variant: 'error',
    text: 'This link isn’t valid. Check that you opened the whole link from the email, or send the form again to get a new one.',
  },
  'too-many-tries': {
    variant: 'error',
    text: 'Too many tries from your connection. Please wait a few minutes and try again.',
  },
  failed: { variant: 'error', text: FORM_MESSAGES.failed },
  offline: { variant: 'error', text: FORM_MESSAGES.offline },
}

/** The fixed message for what happened, so the person knows where they stand. */
export const toConfirmMessage = (answer: ConfirmAnswer | 'offline'): ConfirmMessage =>
  MESSAGES[answer]

/** Whether the link is done with: confirmed now or before. No button then. */
export const isSettled = (answer: ConfirmAnswer | 'offline' | null): boolean =>
  answer === 'confirmed' || answer === 'already-confirmed'
