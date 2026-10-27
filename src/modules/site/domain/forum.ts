/*
 * The neighborhood forum (#485, epic #161): discussions happen on the neighborhood's Discourse
 * forum, not in comments on the site. Editors keep its address in the footer global; the footer
 * and each post page link to it, and both links are hidden when no address is set.
 */

/** The address the footer starts with, and the seed's (the owner confirmed it, 2026-10-27). */
export const FORUM_DEFAULT_URL = 'https://discourse.sprechereast.org'

/** The message Admin shows for an address the forum link can't use. */
export const FORUM_URL_PROBLEM =
  'Enter the forum’s full https address, such as https://forum.example.org.'

/**
 * The forum address to link to, or `null` for none: an absolute https URL with a host, holding no
 * whitespace or control characters. Anything else, including old or imported data, draws no link.
 */
export function toForumUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed === '' || /[\s\u0000-\u001f\u007f]/.test(trimmed)) return null
  try {
    const url = new URL(trimmed)
    return url.protocol === 'https:' && url.hostname !== '' ? trimmed : null
  } catch {
    return null
  }
}

/** The field's check on save: empty is allowed (no forum link), anything else must be https. */
export function validateForumUrl(value: unknown): true | string {
  if (value === null || value === undefined || value === '') return true
  return toForumUrl(value) === null ? FORUM_URL_PROBLEM : true
}
