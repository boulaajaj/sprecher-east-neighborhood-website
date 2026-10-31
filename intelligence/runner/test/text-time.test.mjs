import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { extractJson } from '../lib/model.mjs'
import { robotsAllows } from '../lib/fetchSource.mjs'
import { contentHash, stripMarkup, toSourceText } from '../lib/text.mjs'
import { addDays, dateIn, parseClock, zonedIso } from '../lib/time.mjs'

describe('time', () => {
  it('gives Chicago’s offset for the date: CDT before November 1, CST after', () => {
    assert.equal(
      zonedIso({ year: 2026, month: 10, day: 31, hour: 19 }),
      '2026-10-31T19:00:00-05:00',
    )
    assert.equal(zonedIso({ year: 2026, month: 11, day: 1, hour: 19 }), '2026-11-01T19:00:00-06:00')
    assert.equal(zonedIso({ year: 2027, month: 3, day: 14, hour: 12 }), '2027-03-14T12:00:00-05:00')
  })

  it('reads clock times and dates in Chicago', () => {
    assert.deepEqual(parseClock('7:00 PM'), { hour: 19, minute: 0 })
    assert.deepEqual(parseClock('12:15 am'), { hour: 0, minute: 15 })
    assert.equal(parseClock('TBD'), null)
    assert.equal(dateIn(new Date('2026-10-25T03:00:00Z')), '2026-10-24')
    assert.equal(addDays('2026-10-25', 14), '2026-11-08')
  })
})

describe('text', () => {
  it('strips scripts and markup and decodes entities', () => {
    assert.equal(
      toSourceText('<p>Free&nbsp;concert</p><script>alert(1)</script> Saturday &amp; more'),
      'Free concert Saturday & more',
    )
    assert.ok(!stripMarkup('<SCRIPT src=x></SCRIPT>hi').includes('<'))
  })

  it('hashes the substantive fields only, insensitive to case and spacing', () => {
    const base = {
      title: 'Book Club',
      sourceText: 'Bring a book',
      startsAt: '2026-11-17T19:00:00-06:00',
      endsAt: null,
      allDay: false,
      locationText: 'Pinney',
      sourceStatus: 'scheduled',
    }
    const hash = contentHash(base)
    assert.match(hash, /^[a-f0-9]{64}$/)
    assert.equal(contentHash({ ...base, title: '  book   club ', retrievedAt: 'later' }), hash)
    assert.notEqual(contentHash({ ...base, sourceStatus: 'cancelled' }), hash)
  })
})

describe('robots.txt and answers', () => {
  it('honors Disallow for every user agent', () => {
    const robots = 'User-agent: *\nDisallow: /press/subscribe\n\nUser-agent: other\nDisallow: /'
    assert.ok(robotsAllows(robots, 'https://e.example/press/2026'))
    assert.ok(!robotsAllows(robots, 'https://e.example/press/subscribe?x=1'))
  })

  it('finds the JSON object in a model answer with a fence or words around it', () => {
    assert.deepEqual(extractJson('Here:\n```json\n{"a":1}\n```'), { a: 1 })
    assert.throws(() => extractJson('no json'), /no JSON object/)
  })
})
