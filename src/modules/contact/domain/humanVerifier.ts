/** The answer of a robot check. `reason` is for server logs only, never shown to the visitor. */
export type HumanCheck = { ok: true } | { ok: false; reason: string }

/**
 * Checks that a form submission comes from a person, not a bot (decision 0003). Production uses
 * Cloudflare Turnstile (`TurnstileVerifier`); tests pass a fake.
 */
export interface HumanVerifier {
  /** Whether the check runs at all: it is off until it is configured. */
  isEnabled(): boolean
  /** Checks the token the browser sent. Any error answers `ok: false` (fail closed). */
  verify(token: string | null | undefined): Promise<HumanCheck>
}
