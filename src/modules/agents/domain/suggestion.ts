/**
 * What an agent sends with `submitSuggestion` and `reportItem` (#336), and the rules that turn a
 * suggestion into an event's or a post's fields. Pure, so the MCP tools and their tests share it.
 */

/**
 * Size caps and formats on every argument, the same as the agents' contract in
 * `intelligence/schemas/` (#344), so one call can't store or process more than a real item needs.
 */
export const SUGGESTION_CAPS = {
  runId: 100,
  title: 120,
  bodyMarkdown: 3_000,
  venue: 200,
  address: 300,
  sourceName: 200,
  sourceUrl: 2_048,
  externalId: 200,
  summary: 1_000,
  evidenceItems: 5,
  evidenceSays: 500,
  flags: 20,
} as const

/** `intelligence/schemas/provenance.schema.json`: the source id, a colon, the source's own id. */
export const EXTERNAL_ID = /^[a-z0-9-]+:.+$/
/** sha256 of the candidate's substantive fields, lowercase hex. */
export const CONTENT_HASH = /^[a-f0-9]{64}$/
/** A date-time with seconds optional and a zone (`Z` or an offset). */
export const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/
/** An absolute http(s) link with no spaces. */
export const HTTP_URL = /^https?:\/\/[^\s]+$/

/** What an agent may flag about an item (`common.schema.json#/$defs/flag`). */
export const REVIEW_FLAGS = [
  'missing-date',
  'missing-time',
  'missing-location',
  'ambiguous-location',
  'similar-name',
  'unverified-claim',
  'conflicting-sources',
  'cancelled',
  'rescheduled',
  'past',
  'partisan',
  'prompt-injection',
] as const

export const SUGGESTION_COLLECTIONS = ['events', 'posts'] as const
export type SuggestionCollection = (typeof SUGGESTION_COLLECTIONS)[number]

/** What an agent can report about a run, for an editor to look at. */
export const REVIEW_ITEM_KINDS = [
  { value: 'needs-review', label: 'Needs review' },
  { value: 'update', label: 'Update to existing content' },
  { value: 'cancel', label: 'Cancellation' },
  { value: 'rejected-invalid', label: 'Rejected as invalid' },
] as const

export type ReviewItemKind = (typeof REVIEW_ITEM_KINDS)[number]['value']

/** An event's day and its times, as the events collection stores them. */
export type EventSchedule = { date: string; timeStart: string | null; timeEnd: string | null }

const DAY_ONLY = /^\d{4}-\d{2}-\d{2}$/

/** The calendar day of an instant in a timezone, as `YYYY-MM-DD`. */
const dayIn = (instant: Date, timeZone: string): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone }).format(instant)

/** The time of an instant in a timezone, as events show it: "6:00 PM". */
const timeIn = (instant: Date, timeZone: string): string =>
  new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone }).format(instant)

/**
 * An event's day (midnight UTC, Payload's day-only format) and its start and end times in the
 * site timezone, from `startsAt` and `endsAt` (a day `YYYY-MM-DD`, or an ISO date-time with an
 * offset). A day alone, or `allDay`, gives no times; an end on another day is left out, since an
 * event has one date.
 */
export function toEventSchedule(
  {
    startsAt,
    endsAt,
    allDay,
  }: { startsAt: string; endsAt?: string | null; allDay?: boolean | null },
  timeZone: string,
): EventSchedule {
  if (DAY_ONLY.test(startsAt)) {
    return { date: `${startsAt}T00:00:00.000Z`, timeStart: null, timeEnd: null }
  }
  const start = new Date(startsAt)
  const day = dayIn(start, timeZone)
  const date = `${day}T00:00:00.000Z`
  if (allDay) return { date, timeStart: null, timeEnd: null }
  const end = endsAt && !DAY_ONLY.test(endsAt) ? new Date(endsAt) : null
  const sameDay = end !== null && dayIn(end, timeZone) === day
  return {
    date,
    timeStart: timeIn(start, timeZone),
    timeEnd: end && sameDay ? timeIn(end, timeZone) : null,
  }
}

/**
 * A suggestion's slug: its title in URL form, then the start of its content fingerprint, so two
 * items with the same title don't collide.
 */
export function toSuggestionSlug(title: string, contentHash: string): string {
  const words = title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')
  const suffix = contentHash
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8)
  return [words || 'suggestion', suffix].filter(Boolean).join('-')
}
