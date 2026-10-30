/**
 * Which way an outcome moves the story (#510): `go` (the plan goes ahead), `stop` (it doesn't)
 * or `open` (something else, or it's unclear). It sets the card's icon and tint only; the
 * outcome's own title says what it is, so the tone is never the only signal.
 */
export const OUTCOME_TONES = ['go', 'stop', 'open'] as const

export type OutcomeTone = (typeof OUTCOME_TONES)[number]

export const OUTCOME_TONE_OPTIONS = [
  { label: 'Goes ahead', value: 'go' },
  { label: 'Stops', value: 'stop' },
  { label: 'Something else or unclear', value: 'open' },
] satisfies { label: string; value: OutcomeTone }[]

export function isOutcomeTone(value: unknown): value is OutcomeTone {
  return (OUTCOME_TONES as readonly unknown[]).includes(value)
}
