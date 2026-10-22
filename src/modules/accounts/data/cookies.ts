import 'server-only'

/** A cookie as Payload's `generatePayloadCookie` describes it (`returnCookieAsObject: true`). */
type PayloadCookie = {
  name: string
  value?: string
  domain?: string
  /** A UTC date string */
  expires?: string
  httpOnly?: boolean
  path?: string
  sameSite?: 'Lax' | 'None' | 'Strict'
  secure?: boolean
}

const SAME_SITE = { Lax: 'lax', None: 'none', Strict: 'strict' } as const

/** The same cookie in the shape Next.js's `cookies().set()` takes. */
export type ResponseCookie = {
  name: string
  value: string
  domain?: string
  expires?: Date
  httpOnly?: boolean
  path?: string
  sameSite?: (typeof SAME_SITE)[keyof typeof SAME_SITE]
  secure?: boolean
}

/**
 * Payload's auth cookie for Next.js to set, with every setting kept, so a session started or ended
 * by a server action carries the same cookie as `POST /api/users/login` and `/logout`.
 */
export function toResponseCookie(cookie: PayloadCookie): ResponseCookie {
  return {
    name: cookie.name,
    value: cookie.value ?? '',
    domain: cookie.domain,
    expires: cookie.expires ? new Date(cookie.expires) : undefined,
    httpOnly: cookie.httpOnly,
    path: cookie.path,
    sameSite: cookie.sameSite && SAME_SITE[cookie.sameSite],
    secure: cookie.secure,
  }
}
