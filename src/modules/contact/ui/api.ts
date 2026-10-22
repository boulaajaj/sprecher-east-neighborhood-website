import { getClientSideURL } from '@/utilities/getURL'

import { TURNSTILE_TOKEN_HEADER } from '../domain/turnstile'

/**
 * Sends a form submission to Payload's REST endpoint, where the safeguards run. The body holds
 * only the form's own fields; the robot-check token, when there is one, goes in its header.
 * Resolves with the response whatever its status; rejects only when no answer came back.
 */
export function postFormSubmission(
  formID: string | number | undefined,
  values: Record<string, unknown>,
  token: string | null,
): Promise<Response> {
  return fetch(`${getClientSideURL()}/api/form-submissions`, {
    body: JSON.stringify({
      form: formID,
      submissionData: Object.entries(values).map(([field, value]) => ({ field, value })),
    }),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { [TURNSTILE_TOKEN_HEADER]: token } : {}),
    },
    method: 'POST',
  })
}
