import { load } from 'cheerio'

import { collapse, toSourceText } from './text.mjs'
import { parseClock, zonedIso } from './time.mjs'

// Parsers for the sources that publish no feed, only an HTML page (#390). Each reads the page's
// own list markup, as captured on 2026-10-27, and answers raw items in the same shape as the feed
// parsers (parsers.mjs). A page whose markup changes yields no items, never guessed ones: scout
// then records zero candidates, which the run log shows.

/** An absolute https URL for a link on the page, or null. */
function absolute(href, base) {
  if (!href) return null
  try {
    const url = new URL(href, base)
    return url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

/** A cancellation, rescheduling or postponement named in the title or a tag. */
function statusOf(...texts) {
  const all = texts.filter(Boolean).join(' ')
  if (/cancel/i.test(all)) return 'cancelled'
  if (/reschedul|postpon/i.test(all)) return 'rescheduled'
  return 'scheduled'
}

/**
 * City of Madison article lists: the District 16 alder's blog and City news. Each post is an
 * `.article-summary` with its title link, a `time[datetime]` for when it was posted, and a
 * summary. A post is news: it has no start of its own, and verify reads any meeting it announces
 * from the text.
 */
export function parseCityArticles(body, { base }) {
  const $ = load(body)
  return $('.article-summary')
    .toArray()
    .map((el) => {
      const post = $(el)
      const link = post.find('.article-title a').first()
      const url = absolute(link.attr('href'), base)
      return {
        ownId: url ? new URL(url).pathname : null,
        kind: 'news',
        title: collapse(link.text()) || 'News',
        sourceText: toSourceText(post.find('.article-content').html() ?? ''),
        startsAt: null,
        endsAt: null,
        allDay: null,
        locationText: null,
        sourceStatus: 'unknown',
        url,
        modified: post.find('time[datetime]').first().attr('datetime') ?? null,
      }
    })
    .filter((item) => item.ownId)
}

/**
 * The City's public information meetings: each event has its title link, a start and an end as
 * `time[datetime]` (local time with the offset), its venue ("Virtual event" or a named address),
 * and sometimes a tag ("Full", or a cancellation).
 */
export function parseCityEvents(body, { base }) {
  const $ = load(body)
  return $('.event-heading')
    .toArray()
    .map((el) => {
      const event = $(el).closest('li')
      const link = $(el).find('a').first()
      const url = absolute(link.attr('href'), base)
      const when = event.find('.field-smart-date--standard')
      const startsAt = when.find('time.start-date').attr('datetime') ?? null
      const endsAt = when.find('time.end-date').attr('datetime') ?? null
      const title = collapse(link.text()) || 'Public information meeting'
      const tag = collapse(event.find('.tag').text())
      const venue = collapse(event.find('.event-venues').text())
      return {
        ownId: url ? `${new URL(url).pathname}@${startsAt ?? ''}` : null,
        kind: 'meeting',
        title,
        sourceText: toSourceText([tag && `Tag: ${tag}`, venue].filter(Boolean).join('. ')),
        startsAt,
        endsAt,
        allDay: startsAt ? false : null,
        locationText: venue || null,
        sourceStatus: statusOf(title, tag),
        url,
        modified: null,
      }
    })
    .filter((item) => item.ownId)
}

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

/** "november 10, 2026" as a day; a month alone ("august 2026") gives null. */
function dayOf(text) {
  const match = /^([a-z]+)\s+(\d{1,2}),\s*(\d{4})$/i.exec(collapse(text))
  const month = match ? MONTHS.indexOf(match[1].toLowerCase()) + 1 : 0
  return month ? { year: +match[3], month, day: +match[2] } : null
}

const CLOCK = String.raw`(\d{1,2}(?::\d{2})?)`
const MERIDIEM = String.raw`([ap])\.?\s*m\b\.?`
// "5 to 7 p.m.", "5:30-7 p.m.": the start borrows the end's a.m. or p.m. when it has none
const RANGE = new RegExp(
  String.raw`\b${CLOCK}\s*(?:${MERIDIEM})?\s*(?:to|-|–)\s*${CLOCK}\s*${MERIDIEM}`,
  'i',
)
const SINGLE = new RegExp(String.raw`\b${CLOCK}\s*${MERIDIEM}`, 'i')

/** The first clock time in a text, "5:30 p.m." or "6 PM", or a range's start, as hours and minutes. */
function clockIn(text) {
  const range = RANGE.exec(text)
  if (range) return parseClock(`${range[1]} ${range[2] ?? range[4]}m`)
  const single = SINGLE.exec(text)
  return single ? parseClock(`${single[1]} ${single[2]}m`) : null
}

/**
 * WisDOT's I-39/90/94 project meetings: each is a box with its date as a heading ("november 10,
 * 2026", or only a month for older ones), a title and a description. The page gives the time,
 * when at all, in the description; with none, the date goes in the text for verify to see. Every
 * meeting links to the page itself, which has no page per meeting.
 */
export function parseWisdotMeetings(body, { base }) {
  const $ = load(body)
  return $('.subhead-small-pim')
    .toArray()
    .map((el) => {
      const box = $(el).parent()
      const dateText = collapse($(el).text())
      const title = collapse(box.find('h1, h2, h3').not('.subhead-small-pim').first().text())
      const text = toSourceText(
        box
          .find('p')
          .toArray()
          .map((p) => $(p).html() ?? '')
          .join('\n'),
      )
      // An empty placeholder box (no title, no text) isn't a meeting
      if (!title && !text) return null
      const day = dayOf(dateText)
      const clock = day ? clockIn(text) : null
      const startsAt = day && clock ? zonedIso({ ...day, ...clock }) : null
      const dateNote = startsAt ? null : `Date given as "${dateText}", time not published`
      const slug = `${dateText} ${title}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      return {
        ownId: slug.slice(0, 120),
        kind: 'meeting',
        title: title || 'Public meeting',
        sourceText: toSourceText([dateNote, text].filter(Boolean).join('. ')),
        startsAt,
        endsAt: null,
        allDay: startsAt ? false : null,
        locationText: /virtual/i.test(`${title} ${text}`) ? 'Virtual meeting' : null,
        sourceStatus: statusOf(title),
        url: base,
        modified: null,
      }
    })
    .filter((item) => item?.ownId)
}
