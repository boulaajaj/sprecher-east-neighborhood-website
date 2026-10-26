/**
 * Under what terms the site may show an image (#362). Agents never upload images; an editor
 * records this when adding one, so every photo can be credited and its use checked.
 */
export const MEDIA_LICENSES = [
  { value: 'own', label: 'Our own photo' },
  { value: 'permission', label: 'Used with permission' },
  { value: 'cc-by', label: 'CC BY' },
  { value: 'cc-by-sa', label: 'CC BY-SA' },
  { value: 'cc0', label: 'CC0 or public domain' },
  { value: 'other', label: 'Other (say which in the credit)' },
] as const

export type MediaLicense = (typeof MEDIA_LICENSES)[number]['value']

/** The short names a credit line shows; `own`, `permission` and `other` show none. */
const CREDIT_NAMES: Partial<Record<MediaLicense, string>> = {
  'cc-by': 'CC BY',
  'cc-by-sa': 'CC BY-SA',
  cc0: 'CC0',
}

/**
 * The license as a credit line names it, with the version read from a Creative Commons license
 * link ("CC BY-SA 2.0" from `https://creativecommons.org/licenses/by-sa/2.0/`), or null when
 * the line shouldn't name one (#405).
 */
export function toLicenseName(
  license: string | null | undefined,
  licenseUrl: string | null | undefined,
): string | null {
  const name = license ? CREDIT_NAMES[license as MediaLicense] : undefined
  if (!name) return null
  const version = licenseUrl?.match(
    /creativecommons\.org\/(?:licenses|publicdomain)\/[a-z-]+\/(\d+\.\d+)/i,
  )
  return version ? `${name} ${version[1]}` : name
}
