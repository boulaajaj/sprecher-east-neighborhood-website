/**
 * Client IP from proxy headers. Caddy sets X-Forwarded-For to the connecting client's address
 * (it doesn't trust an incoming header unless trusted_proxies is configured), so the first
 * entry is the visitor. Falls back to X-Real-IP.
 */
export function clientIpFromHeaders(headers: Headers | undefined | null): string | null {
  if (!headers) return null
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || null
  return headers.get('x-real-ip')
}
