import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseIcs } from '../lib/ics.mjs'

const cal = (...events) => ['BEGIN:VCALENDAR', ...events.flat(), 'END:VCALENDAR'].join('\r\n')
const ev = (...lines) => ['BEGIN:VEVENT', ...lines, 'END:VEVENT']

describe('iCalendar', () => {
  it('expands a series that started long ago into the window', () => {
    const items = parseIcs(
      cal(
        ev(
          'UID:a',
          'DTSTART;TZID=America/Chicago:20240101T090000',
          'RRULE:FREQ=DAILY',
          'SUMMARY:Daily',
        ),
      ),
      { from: '2026-10-25', days: 3 },
    )
    assert.deepEqual(
      items.map((i) => i.startsAt),
      ['2026-10-25T09:00:00-05:00', '2026-10-26T09:00:00-05:00', '2026-10-27T09:00:00-05:00'],
    )
  })

  it('applies a cancellation given in UTC, keeps going past a moved instance, and keeps IDs stable', () => {
    const items = parseIcs(
      cal(
        ev(
          'UID:b',
          'DTSTART;TZID=America/Chicago:20261103T103000',
          'RRULE:FREQ=WEEKLY;COUNT=4',
          'SUMMARY:Story',
        ),
        ev(
          'UID:b',
          'RECURRENCE-ID;TZID=America/Chicago:20261103T103000',
          'DTSTART;TZID=America/Chicago:20270203T103000',
          'SUMMARY:Story',
        ),
        ev(
          'UID:b',
          'RECURRENCE-ID:20261110T163000Z',
          'DTSTART;TZID=America/Chicago:20261110T103000',
          'STATUS:CANCELLED',
          'SUMMARY:Story',
        ),
      ),
      { from: '2026-10-25', days: 60 },
    )
    assert.deepEqual(
      items.map((i) => [i.ownId, i.sourceStatus]),
      [
        ['b@2026-11-10T10:30', 'cancelled'],
        ['b@2026-11-17T10:30', 'scheduled'],
        ['b@2026-11-24T10:30', 'scheduled'],
      ],
    )
  })

  it('converts UTC times to Chicago and links only the feed’s own site', () => {
    const [item] = parseIcs(
      cal(
        ev(
          'UID:c',
          'DTSTART:20261201T010000Z',
          'SUMMARY:UTC',
          'DESCRIPTION:See https://evil.example/x and https://www.madisonpubliclibrary.org/events/9.',
        ),
      ),
      { from: '2026-10-25', host: 'madisonpubliclibrary.org' },
    )
    assert.equal(item.startsAt, '2026-11-30T19:00:00-06:00')
    assert.equal(item.url, 'https://www.madisonpubliclibrary.org/events/9')
  })
})
