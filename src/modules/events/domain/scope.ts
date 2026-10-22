/**
 * The two event listings: upcoming (dated today or later in the site timezone) and past (dated
 * before today). The query that applies the rule is `inScope` in data/scope.ts.
 */
export const EVENT_SCOPES = ['upcoming', 'past'] as const

export type EventScope = (typeof EVENT_SCOPES)[number]

/** Checks a scope coming from a URL or a client request. */
export function isEventScope(value: unknown): value is EventScope {
  return EVENT_SCOPES.some((scope) => scope === value)
}
