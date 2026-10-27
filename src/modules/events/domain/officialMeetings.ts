/**
 * An official meeting is a public body's own meeting, such as the Common Council, a city
 * commission or the County Board (#122). It is marked "Official meeting" wherever it shows, and
 * its page links to the body's own agenda. The bodies are also the collection's options.
 */
export const OFFICIAL_BODIES = [
  { value: 'city', label: 'City of Madison' },
  { value: 'county', label: 'Dane County' },
] as const

export type OfficialBody = (typeof OFFICIAL_BODIES)[number]['value']

/** The body's name, for example "City of Madison" for `city`. */
export function formatOfficialBody(body: OfficialBody): string {
  return OFFICIAL_BODIES.find(({ value }) => value === body)?.label ?? body
}

/** True for a known body; anything else stored in the field counts as no body. */
export function isOfficialBody(value: unknown): value is OfficialBody {
  return OFFICIAL_BODIES.some((body) => body.value === value)
}

/**
 * True for an absolute `https://` link, the only kind an agenda link may be: no `http:`, no
 * `javascript:` or other scheme, no relative path.
 */
export function isAgendaUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname !== ''
  } catch {
    return false
  }
}

/** The collection field's check: blank is fine (the link is optional), anything else must pass. */
export function validateAgendaUrl(value: unknown): true | string {
  if (value === null || value === undefined || value === '') return true
  return isAgendaUrl(value) || 'Enter the full agenda link, starting with https://'
}
