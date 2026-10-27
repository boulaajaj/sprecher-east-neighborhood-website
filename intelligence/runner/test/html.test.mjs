import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import { parseCityArticles, parseCityEvents, parseWisdotMeetings } from '../lib/html.mjs'
import { parserFor } from '../lib/parsers.mjs'
import { keepItem, areaMatcher, scoutSource } from '../lib/scout.mjs'
import { atNoon, budgets, contract, fakeHttp } from './helpers.mjs'

// The HTML parsers (#390), on trimmed copies of each page's real markup (test/pages/README.md).

const page = (name) => readFileSync(new URL(`./pages/${name}`, import.meta.url), 'utf8')
const source = (id) => contract.registry.sources.find((s) => s.id === id)
const parse = (id, name) => parserFor(source(id))(page(name), { base: source(id).canonicalUrl })

describe('City article lists: the District 16 blog and City news', () => {
  it('reads each post as news with its own address, title, summary and posted time', () => {
    const [post] = parse('district16-blog', 'district16-blog.html')

    assert.deepEqual(post, {
      ownId: '/council/district16/blog/2026-10-27/upcoming-public-information-meetings',
      kind: 'news',
      title: 'Upcoming Public Information Meetings',
      sourceText:
        "Draft Framework to Regulate Data Centers in Madison PMI. The City of Madison's Department of Planning and Community and Economic Development will hold a public information meeting on Tuesday, October 27, 2026, to update community members on a draft…",
      startsAt: null,
      endsAt: null,
      allDay: null,
      locationText: null,
      sourceStatus: 'unknown',
      url: 'https://www.cityofmadison.com/council/district16/blog/2026-10-27/upcoming-public-information-meetings',
      modified: '2026-10-27T12:08:19-05:00',
    })
  })

  it('strips scripts from the summary, as every source does', () => {
    const posts = parse('district16-blog', 'district16-blog.html')

    assert.equal(posts.length, 2)
    assert.doesNotMatch(posts[1].sourceText, /script|alert/)
  })

  it('reads City news with the same parser, and keeps only releases that name the area', () => {
    const news = parse('city-news', 'city-news.html')
    const namesArea = areaMatcher(contract.area)

    assert.equal(news.length, 2)
    assert.deepEqual(
      news.filter((item) => keepItem(source('city-news'), item, namesArea)).map((i) => i.title),
      ['Cottage Grove Road Resurfacing Begins'],
    )
  })

  it('answers no items, not guessed ones, for a page whose markup changed', () => {
    assert.deepEqual(
      parseCityArticles('<main><p>Redesigned</p></main>', { base: 'https://x.gov/' }),
      [],
    )
  })
})

describe('City public information meetings', () => {
  it('reads start, end and venue from the page’s own date-times and address', () => {
    const [virtual, inPerson] = parse('city-public-info-meetings', 'public-info-meetings.html')

    assert.equal(virtual.title, 'Draft Data Center Regulation Framework Public Information Meeting')
    assert.equal(virtual.kind, 'meeting')
    assert.equal(virtual.startsAt, '2026-10-27T17:30:00-05:00')
    assert.equal(virtual.endsAt, '2026-10-27T19:30:00-05:00')
    assert.equal(virtual.allDay, false)
    assert.equal(virtual.locationText, 'Virtual event')
    assert.equal(virtual.sourceStatus, 'scheduled')
    assert.match(virtual.sourceText, /Tag: Full/)
    assert.equal(
      virtual.url,
      'https://www.cityofmadison.com/dpced/events/2026-10-27/draft-data-center-regulation-framework-public-information-meeting',
    )
    assert.equal(inPerson.locationText, 'Freedom Inc Office 2110 Luann Lane')
  })

  it('marks a meeting whose tag says it is cancelled', () => {
    const meetings = parse('city-public-info-meetings', 'public-info-meetings.html')

    assert.equal(meetings[2].sourceStatus, 'cancelled')
    assert.equal(meetings[2].startsAt, '2026-11-12T18:00:00-06:00')
  })

  it('gives each meeting an id from its page and start, so a moved meeting is a new item', () => {
    const ids = parse('city-public-info-meetings', 'public-info-meetings.html').map((m) => m.ownId)

    assert.equal(new Set(ids).size, 3)
    assert.equal(
      ids[1],
      '/independent-police-monitor/events/2026-10-29/pcob-hiring-listening-session@2026-10-29T18:00:00-05:00',
    )
  })
})

describe('WisDOT I-39/90/94 meetings', () => {
  it('keeps a day with no published time as a date in the text, not a made-up start', () => {
    const [corridor] = parse('wisdot-i39-90-94', 'wisdot-news-and-meetings.html')

    assert.equal(corridor.title, 'Corridor-wide Virtual Public Meeting')
    assert.equal(corridor.startsAt, null)
    assert.equal(corridor.allDay, null)
    assert.match(corridor.sourceText, /^Date given as "november 10, 2026", time not published\./)
    assert.equal(corridor.locationText, 'Virtual meeting')
    assert.equal(corridor.url, source('wisdot-i39-90-94').canonicalUrl)
  })

  it('takes the time from the description when it gives one, in the site’s timezone', () => {
    const [, lyndon] = parse('wisdot-i39-90-94', 'wisdot-news-and-meetings.html')

    assert.equal(lyndon.startsAt, '2026-10-29T17:00:00-05:00')
    assert.match(lyndon.sourceText, /Juneau County/)
  })

  it('keeps a month-only meeting without a start, and drops an empty placeholder box', () => {
    const meetings = parse('wisdot-i39-90-94', 'wisdot-news-and-meetings.html')

    assert.deepEqual(
      meetings.map((m) => m.title),
      [
        'Corridor-wide Virtual Public Meeting',
        'Upcoming Public Meeting',
        'Noise Barrier Public Meeting',
      ],
    )
    assert.equal(meetings[2].startsAt, null)
    assert.match(meetings[2].sourceText, /"august 2026"/)
  })

  it('answers no items for a page without meeting boxes', () => {
    assert.deepEqual(parseWisdotMeetings('<h1>News</h1>', { base: 'https://x.gov/' }), [])
    assert.deepEqual(parseCityEvents('<h1>Events</h1>', { base: 'https://x.gov/' }), [])
  })
})

describe('scouting an HTML source end to end', () => {
  it('turns the WisDOT page into schema-valid candidates', async () => {
    const http = fakeHttp([
      { status: 200, contentType: 'text/html', body: page('wisdot-news-and-meetings.html') },
    ])
    const result = await scoutSource(source('wisdot-i39-90-94'), {
      area: contract.area,
      state: { sources: {}, seen: {} },
      http,
      budgets,
      validate: contract.validator('schemas/candidate.schema.json'),
      now: atNoon('2026-10-27'),
    })

    assert.equal(result.check.status, 'ok')
    assert.deepEqual(result.invalid, [])
    assert.equal(result.candidates.length, 3)
    assert.ok(result.candidates.every((c) => c.sourceId === 'wisdot-i39-90-94'))
    assert.deepEqual(http.requested, [source('wisdot-i39-90-94').canonicalUrl])
  })
})
