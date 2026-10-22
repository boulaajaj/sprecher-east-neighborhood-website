import { APIError, type CollectionBeforeValidateHook } from 'payload'

import { checkSubmissionSize } from '../domain/submissionSize'

/**
 * Rejects oversized or malformed public form submissions before anything else runs (no Turnstile
 * call, no database write): 413 when over a limit, 400 when the rows aren't what a form sends.
 * Applies to every form built in the CMS; the limits are generous for normal use.
 */
export const limitSubmissionSize: CollectionBeforeValidateHook = ({ data, operation }) => {
  if (operation !== 'create' || !data) return data

  const check = checkSubmissionSize(data.submissionData)
  if (check === 'too-large') {
    throw new APIError(
      'Your message is too long to send. Please shorten it and try again.',
      413,
      null,
      true,
    )
  }
  if (check === 'malformed') {
    throw new APIError(
      'This form couldn’t be read. Please reload the page and try again.',
      400,
      null,
      true,
    )
  }
  return data
}
