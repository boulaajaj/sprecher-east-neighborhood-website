// Direct fetching (README.md, "Fetching"; scout.md step 2): one plain GET with a clear user agent,
// a 30-second timeout and the saved ETag or Last-Modified. A 304 ends the source's run; a redirect
// is followed directly (at most 3 hops) unless it leads to a gate; a 5xx or 429 is retried once;
// any other 4xx is an error; a 401, 403, 451, login page, CAPTCHA, paywall or bot gateway is a
// gate. robots.txt is honored by choice. Playwright isn't built yet (#364): a source that would
// need it is skipped by scout before it gets here.

export const USER_AGENT =
  'SprecherEastIntelligence/1.0 (+https://sprechereast.com; neighborhood news digest for editors)'
const TIMEOUT_MS = 30_000
const MAX_HOPS = 3
const MAX_RETRY_WAIT_MS = 30_000
const GATE_URL = /tollbit|captcha|challenge|\/login|\/signin|sign-in|paywall|subscribe/i
const GATE_STATUS = new Set([401, 403, 451])

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Whether robots.txt lets any user agent fetch `url`'s path (simple Disallow prefixes). */
export function robotsAllows(robotsText, url) {
  const { pathname, search } = new URL(url)
  const target = `${pathname}${search}`
  let applies = false
  const disallowed = []
  for (const raw of robotsText.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim()
    const [field, ...rest] = line.split(':')
    const value = rest.join(':').trim()
    if (/^user-agent$/i.test(field)) applies = value === '*'
    else if (applies && /^disallow$/i.test(field) && value) disallowed.push(value)
  }
  return !disallowed.some((prefix) => target.startsWith(prefix))
}

/**
 * Fetches one source URL. `http` is `fetch` or a test double with the same shape. Answers
 * `{ status, body, etag, lastModified, retries, error }`, status being `ok`, `not-modified`,
 * `blocked` or `error`.
 */
export async function fetchDirect(url, { http = fetch, etag, lastModified, robots } = {}) {
  if (robots && !(await robots(url))) {
    return { status: 'blocked', retries: 0, error: 'robots.txt disallows this path' }
  }
  let current = url
  let retries = 0
  for (let hop = 0; hop <= MAX_HOPS; ) {
    const headers = { 'user-agent': USER_AGENT, accept: '*/*' }
    if (etag) headers['if-none-match'] = etag
    if (lastModified) headers['if-modified-since'] = lastModified
    let response
    try {
      response = await http(current, {
        headers,
        redirect: 'manual',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch (error) {
      if (retries === 0) {
        retries = 1
        continue
      }
      return { status: 'error', retries, error: `no answer: ${error.message ?? error}` }
    }
    const code = response.status
    if (code === 304) return { status: 'not-modified', retries }
    if (code >= 300 && code < 400) {
      const location = response.headers.get('location')
      if (!location) return { status: 'error', retries, error: `${code} without a location` }
      const next = new URL(location, current).toString()
      if (GATE_URL.test(next))
        return { status: 'blocked', retries, error: `redirect to a gate: ${next}` }
      current = next
      hop++
      continue
    }
    if (GATE_STATUS.has(code)) return { status: 'blocked', retries, error: `${code}` }
    if (code === 429 || code >= 500) {
      if (retries === 0) {
        retries = 1
        const after = Number(response.headers.get('retry-after'))
        await sleep(Number.isFinite(after) ? Math.min(after * 1000, MAX_RETRY_WAIT_MS) : 0)
        continue
      }
      return { status: 'error', retries, error: `${code} after one retry` }
    }
    if (code >= 400) return { status: 'error', retries, error: `${code}` }
    const body = await response.text()
    return {
      status: 'ok',
      retries,
      body,
      contentType: response.headers.get('content-type') ?? '',
      etag: response.headers.get('etag') ?? null,
      lastModified: response.headers.get('last-modified') ?? null,
    }
  }
  return { status: 'error', retries, error: `more than ${MAX_HOPS} redirects` }
}

/** A robots.txt check that fetches each host's file once per run. Unreachable means allowed. */
export function robotsChecker(http = fetch) {
  const cache = new Map()
  return async (url) => {
    const { origin } = new URL(url)
    if (!cache.has(origin)) {
      cache.set(
        origin,
        http(`${origin}/robots.txt`, {
          headers: { 'user-agent': USER_AGENT },
          signal: AbortSignal.timeout(TIMEOUT_MS),
        })
          .then((r) => (r.ok ? r.text() : ''))
          .catch(() => ''),
      )
    }
    return robotsAllows(await cache.get(origin), url)
  }
}
