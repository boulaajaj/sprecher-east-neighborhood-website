import { isSingleAddress } from '@/platform/lib'

/** The longest address SMTP allows (RFC 5321). */
const MAX_ADDRESS_LENGTH = 254

/**
 * An email address as the site stores it (trimmed, lowercase), or `null` when the value isn't
 * one plain address. Lowercase, so "Ana@Example.com" and "ana@example.com" are one record.
 */
export function parseEmailAddress(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const address = value.trim().toLowerCase()
  if (address.length > MAX_ADDRESS_LENGTH || !isSingleAddress(address)) return null
  return address
}
