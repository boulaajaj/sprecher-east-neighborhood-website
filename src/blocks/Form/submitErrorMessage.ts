import { FORM_MESSAGES } from '@/platform/ui'

/**
 * What a visitor reads when a form submission fails, picked by HTTP status. Always one of these
 * fixed texts, never the server's own message (#204); the server logs the details.
 * `null`: the request never got an answer (offline, or blocked).
 */
export function toSubmitErrorMessage(status: number | null): string {
  if (status === null) return FORM_MESSAGES.offline
  if (status === 429) return 'Too many messages from your connection. Please try again later.'
  if (status === 413) return 'Your message is too long to send. Please shorten it and try again.'
  // A 400 is a failed robot check, a malformed submission or a validation error: one text fits all
  if (status === 400) {
    return 'We couldn’t send your message. Please try again; if it keeps happening, reload the page.'
  }
  return 'Something went wrong and your message wasn’t sent. Please try again in a few minutes.'
}
