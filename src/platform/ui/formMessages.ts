/**
 * Fixed texts a form shows when sending fails for a reason that isn't the form's own (#204).
 * Each form adds its own texts for the cases only it has.
 */
export const FORM_MESSAGES = {
  /** The request never got an answer: offline, or blocked */
  offline: 'We couldn’t reach the site. Check your connection and try again.',
  /** HTTP 429 */
  tooManyTries: 'Too many tries. Please wait a few minutes and try again.',
  /** Anything unexpected */
  failed: 'Something went wrong. Please try again.',
} as const
