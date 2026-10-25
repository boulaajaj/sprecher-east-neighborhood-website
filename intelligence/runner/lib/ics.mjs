import ICAL from 'ical.js'

import { collapse, toSourceText } from './text.mjs'
import { addDays, dateIn, zonedIso } from './time.mjs'

// iCalendar (scout.md step 4): recurring events expanded by ical.js, one item per instance.

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

// America/Chicago's rules since 2007, registered once, so times with that TZID convert even when
// a feed leaves out its VTIMEZONE, and a UTC RECURRENCE-ID matches its series' local one.
const CHICAGO_VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  'TZID:America/Chicago',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:-0600',
  'TZOFFSETTO:-0500',
  'TZNAME:CDT',
  'DTSTART:20070311T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:-0500',
  'TZOFFSETTO:-0600',
  'TZNAME:CST',
  'DTSTART:20071104T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
].join('\r\n')

function registerTimezones(calendar) {
  if (!ICAL.TimezoneService.has('America/Chicago')) {
    ICAL.TimezoneService.register(new ICAL.Component(ICAL.parse(CHICAGO_VTIMEZONE)))
  }
  for (const vtimezone of calendar.getAllSubcomponents('vtimezone')) {
    const tzid = vtimezone.getFirstPropertyValue('tzid')
    if (tzid && !ICAL.TimezoneService.has(tzid)) ICAL.TimezoneService.register(vtimezone)
  }
}

/**
 * An iCalendar time as an ISO date-time: a date is local midnight; a time in a known zone (UTC,
 * Chicago, or one the file defines) is converted to Chicago; a floating time, or one whose zone
 * the file doesn't define, is read as Chicago wall time.
 */
function icalIso(time) {
  if (time.isDate) return zonedIso({ year: time.year, month: time.month, day: time.day })
  const zone = time.zone
  if (zone && zone !== ICAL.Timezone.localTimezone && zone.tzid !== 'floating') {
    return zonedIso(chicagoParts(time.toJSDate()))
  }
  const { year, month, day, hour, minute } = time
  return zonedIso({ year, month, day, hour, minute })
}

/** The source's own event page from a DESCRIPTION: an https link on the feed's own site. */
function ownLink(text, host) {
  for (const match of String(text ?? '').matchAll(/https:\/\/[^\s<>"]+/g)) {
    try {
      const url = new URL(match[0].replace(/[).,;]+$/, ''))
      if (host && (url.hostname === host || url.hostname.endsWith(`.${host}`)))
        return url.toString()
    } catch {
      // not a link
    }
  }
  return null
}

/** How many occurrences a series is walked through at most, from its own start. */
const MAX_OCCURRENCES = 10_000

/**
 * iCalendar: one item per instance from `from` on (the source's treatment: "Keep only DTSTART
 * from today on"), recurrences expanded up to `days` ahead by ical.js, which applies each
 * exception (a moved, changed or cancelled instance) to its series. An instance's ID is its
 * UID and its original date (RECURRENCE-ID), so it stays the same when the instance moves.
 * `host` is the feed's own site, for the event-page link.
 */
export function parseIcs(body, { from, days = 60, host } = {}) {
  const calendar = new ICAL.Component(ICAL.parse(body))
  registerTimezones(calendar)
  const components = calendar.getAllSubcomponents('vevent')
  const masters = new Map()
  const exceptions = []
  for (const component of components) {
    const event = new ICAL.Event(component, { strictExceptions: true })
    if (event.isRecurrenceException()) exceptions.push(event)
    else masters.set(event.uid, event)
  }
  const orphans = []
  for (const exception of exceptions) {
    const master = masters.get(exception.uid)
    if (master) master.relateException(exception)
    else orphans.push(exception)
  }
  const start = from ?? dateIn(new Date())
  const end = addDays(start, days)
  const inWindow = (iso) => iso.slice(0, 10) >= start && iso.slice(0, 10) < end
  const items = []
  const toItem = (event, startTime, endTime, ownId) => {
    const status = String(event.component.getFirstPropertyValue('status') ?? '').toLowerCase()
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
      url: ownLink(description, host),
      modified: event.component.getFirstPropertyValue('last-modified')?.toString() ?? null,
    }
  }
  const instanceId = (uid, recurrenceId) => `${uid}@${icalIso(recurrenceId).slice(0, 16)}`
  for (const event of masters.values()) {
    if (!event.isRecurring()) {
      const item = toItem(event, event.startDate, event.endDate, event.uid)
      if (inWindow(item.startsAt)) items.push(item)
      continue
    }
    const iterator = event.iterator()
    for (
      let n = 0, next = iterator.next();
      next && n < MAX_OCCURRENCES;
      next = iterator.next(), n++
    ) {
      const original = icalIso(next)
      // Past the window by its original date: done (an instance moved into the window from
      // further out is the one case this misses)
      if (original.slice(0, 10) >= end) break
      const details = event.getOccurrenceDetails(next)
      const item = toItem(
        details.item,
        details.startDate,
        details.endDate,
        instanceId(event.uid, next),
      )
      if (inWindow(item.startsAt)) items.push(item)
    }
  }
  for (const orphan of orphans) {
    const item = toItem(
      orphan,
      orphan.startDate,
      orphan.endDate,
      instanceId(orphan.uid, orphan.recurrenceId),
    )
    if (inWindow(item.startsAt)) items.push(item)
  }
  return items
}
