import 'server-only'

/**
 * Logs that an account action failed on our side, with only the error's class name. Never the
 * error itself: a database error carries the query's values, here the email (#231).
 */
export function logServerFailure(action: string, error: unknown): void {
  const name = error instanceof Error ? error.name : typeof error
  console.error(`${action} failed on the server (${name})`)
}
