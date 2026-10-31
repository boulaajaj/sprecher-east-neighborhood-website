/**
 * The "Open in Google Maps" link for an event: the editor's map link if set, otherwise a plain
 * search for the address (no API key, no embedded map). `null` when there is neither.
 */
export function toMapsHref(mapsUrl: string | null, address: string | null): string | null {
  if (mapsUrl) return mapsUrl
  if (!address) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}
