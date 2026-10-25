import { XMLParser } from 'fast-xml-parser'
import ICAL from 'ical.js'

import { collapse, toSourceText } from './text.mjs'
import { addDays, dateIn, parseClock, zonedIso } from './time.mjs'

// One parser per source format (scout.md step 4). Each answers raw items: the source's own ID and
// the candidate fields as the source gives them. Scout adds provenance, hashing and change.

const ymd = (text) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text ?? '')
  return match ? { year: +match[1], month: +match[2], day: +match[3] } : null
}

/** Legistar's status words: a cancellation wins over "rescheduled to ...". */
function legistarStatus(...texts) {
  const all = texts.filter(Boolean).join(' ')
  if (/cancel/i.test(all)) return 'cancelled'
  if (/reschedul|postpon/i.test(all)) return 'rescheduled'
  return 'scheduled'
}

/** Legistar events: a local date (`EventDate`) and a local clock time (`EventTime`). */
export function parseLegistarEvents(body) {
  const rows = JSON.parse(body)
  if (!Array.isArray(rows)) throw new Error('Legistar events: expected a JSON array')
  return rows.map((row) => {
    const day = ymd(row.EventDate)
    const clock = parseClock(row.EventTime)
    const startsAt = day ? zonedIso({ ...day, ...(clock ?? {}) }) : null
    const status = legistarStatus(row.EventAgendaStatusName, row.EventComment)
    return {
      ownId: String(row.EventId),
      kind: 'meeting',
      title: collapse(row.EventBodyName) || 'Meeting',
      sourceText: toSourceText(
        [row.EventComment, row.EventAgendaStatusName].filter(Boolean).join('. '),
      ),
      startsAt,
      endsAt: null,
      allDay: day && clock ? false : null,
      locationText: collapse(row.EventLocation) || null,
      sourceStatus: status,
      url: typeof row.EventInSiteURL === 'string' ? row.EventInSiteURL : null,
      modified: row.EventLastModifiedUtc ?? null,
    }
  })
}

/** Legistar matters: legislation, no date of its own; the cursor is the newest change. */
export function parseLegistarMatters(body) {
  const rows = JSON.parse(body)
  if (!Array.isArray(rows)) throw new Error('Legistar matters: expected a JSON array')
  return rows.map((row) => ({
    ownId: String(row.MatterId),
    kind: 'legislation',
    title: collapse(row.MatterTitle || row.MatterName || `File ${row.MatterFile}`).slice(0, 300),
    sourceText: toSourceText(
      [
        row.MatterFile && `File ${row.MatterFile}`,
        row.MatterTypeName,
        row.MatterStatusName,
        row.MatterTitle,
      ]
        .filter(Boolean)
        .join('. '),
    ),
    startsAt: null,
    endsAt: null,
    allDay: null,
    locationText: null,
    sourceStatus: 'unknown',
    url: `https://webapi.legistar.com/v1/madison/matters/${row.MatterId}`,
    modified: row.MatterLastModifiedUtc ?? null,
  }))
}

/** Chicago wall time of an instant, as zonedIso's parts. */
function chicagoParts(instant) {
  const [year, month, day] = dateIn(instant).split('-').map(Number)
  const [hour, minute] = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Chicago',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .format(instant)
    .split(':')
    .map(Number)
  return { year, month, day, hour, minute }
}

/**
 * An iCalendar time as an ISO date-time: a date is local midnight; a UTC time is converted to
 * Chicago; a floating time or one with a TZID is read as Chicago wall time (the library's feed
 * uses America/Chicago).
 */
function icalIso(time) {
  if (time.isDate) return zonedIso({ year: time.year, month: time.month, day: time.day })
  if (time.zone === ICAL.Timezone.utcTimezone || time.zone?.tzid === 'UTC') {
    return zonedIso(chicagoParts(time.toJSDate()))
  }
  const { year, month, day, hour, minute } = time
  return zonedIso({ year, month, day, hour, minute })
}

/** The first event page linked in a DESCRIPTION, since the library's events have no URL. */
const linkIn = (text) => /https?:\/\/[^\s<>"]+/.exec(text ?? '')?.[0] ?? null

/**
 * iCalendar: one item per instance from `from` on (the source's treatment: "Keep only DTSTART
 * from today on"), recurrences expanded up to 60 days ahead, each with its own ID (`UID` plus the
 * instance date for a recurrence); an exception keeps its status.
 */
export function parseIcs(body, { from, days = 60 } = {}) {
  const calendar = new ICAL.Component(ICAL.parse(body))
  const events = calendar.getAllSubcomponents('vevent').map((v) => new ICAL.Event(v))
  const exceptions = new Map()
  for (const event of events) {
    if (event.isRecurrenceException())
      exceptions.set(`${event.uid}|${event.recurrenceId.toString()}`, event)
  }
  const start = from ?? dateIn(new Date())
  const end = addDays(start, days)
  const inWindow = (iso) => iso.slice(0, 10) >= start && iso.slice(0, 10) < end
  const items = []
  const toItem = (event, startTime, endTime, ownId) => {
    const component = event.component
    const status = String(component.getFirstPropertyValue('status') ?? '').toLowerCase()
    const description = event.description ?? ''
    return {
      ownId,
      kind: 'event',
      title: collapse(event.summary) || 'Event',
      sourceText: toSourceText(description),
      startsAt: icalIso(startTime),
      endsAt: endTime && !startTime.isDate ? icalIso(endTime) : null,
      allDay: startTime.isDate,
      locationText: collapse(event.location) || null,
      sourceStatus: status === 'cancelled' ? 'cancelled' : 'scheduled',
      url: linkIn(description),
      modified: component.getFirstPropertyValue('last-modified')?.toString() ?? null,
    }
  }
  for (const event of events) {
    if (event.isRecurrenceException()) continue
    if (!event.isRecurring()) {
      const item = toItem(event, event.startDate, event.endDate, event.uid)
      if (inWindow(item.startsAt)) items.push(item)
      continue
    }
    const iterator = event.iterator()
    for (let next = iterator.next(), n = 0; next && n < 400; next = iterator.next(), n++) {
      const occurrence = event.getOccurrenceDetails(next)
      const override = exceptions.get(`${event.uid}|${next.toString()}`)
      const source = override ?? event
      const startTime = override ? override.startDate : occurrence.startDate
      const endTime = override ? override.endDate : occurrence.endDate
      const iso = icalIso(startTime)
      if (iso.slice(0, 10) >= end) break
      if (iso.slice(0, 10) < start) continue
      items.push(toItem(source, startTime, endTime, `${event.uid}@${iso.slice(0, 10)}`))
    }
  }
  return items
}

const xml = new XMLParser({ ignoreAttributes: false, processEntities: true, trimValues: true })
const asArray = (value) => (Array.isArray(value) ? value : value === undefined ? [] : [value])
const textOf = (value) =>
  typeof value === 'object' && value !== null ? (value['#text'] ?? '') : (value ?? '')

/** RSS 2.0 or Atom news: dedupe on guid or id; a news item has no start. */
export function parseFeed(body) {
  const doc = xml.parse(body)
  const rssItems = asArray(doc?.rss?.channel?.item)
  const atomItems = asArray(doc?.feed?.entry)
  const fromRss = rssItems.map((item) => ({
    ownId: collapse(textOf(item.guid)) || collapse(textOf(item.link)),
    url: collapse(textOf(item.link)) || null,
    title: collapse(toSourceText(textOf(item.title))) || 'News',
    text: textOf(item['content:encoded']) || textOf(item.description),
    modified: textOf(item.pubDate) || null,
  }))
  const fromAtom = atomItems.map((entry) => {
    const link = asArray(entry.link).find((l) => !l['@_rel'] || l['@_rel'] === 'alternate')
    return {
      ownId: collapse(textOf(entry.id)),
      url: link?.['@_href'] ?? null,
      title: collapse(toSourceText(textOf(entry.title))) || 'News',
      text: textOf(entry.content) || textOf(entry.summary),
      modified: textOf(entry.updated) || null,
    }
  })
  return [...fromRss, ...fromAtom]
    .filter((item) => item.ownId)
    .map((item) => ({
      ownId: item.ownId,
      kind: 'news',
      title: item.title,
      sourceText: toSourceText(item.text),
      startsAt: null,
      endsAt: null,
      allDay: null,
      locationText: null,
      sourceStatus: 'unknown',
      url: item.url,
      modified: item.modified,
    }))
}

export const PARSERS = {
  'legistar-events': parseLegistarEvents,
  'legistar-matters': parseLegistarMatters,
}

/** The parser for a source: by id when it has its own, else by format. HTML is not built yet. */
export function parserFor(source) {
  if (PARSERS[source.id]) return PARSERS[source.id]
  if (source.format === 'ics') return parseIcs
  if (source.format === 'rss' || source.format === 'atom') return parseFeed
  return null
}
