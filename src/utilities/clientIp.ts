/**
 * Client IP from proxy headers. Caddy (2.5+, no trusted_proxies) replaces any
 * X-Forwarded-For the client sends with the connecting address, so the first entry is the
 * visitor. Anyone who can reach the Node port directly could spoof it; it's only used as an
 * advisory value (Turnstile remoteip, rate-limit key).
 */
export function clientIpFromHeaders(headers: Headers | undefined | null): string | null {
  if (!headers) return null
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || null
  return headers.get('x-real-ip')
}
