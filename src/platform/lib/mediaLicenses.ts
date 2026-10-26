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

/** Each Creative Commons license: the name a credit line shows and its path on creativecommons.org. */
const CC_LICENSES: Partial<Record<MediaLicense, { name: string; path: string }>> = {
  'cc-by': { name: 'CC BY', path: 'licenses/by' },
  'cc-by-sa': { name: 'CC BY-SA', path: 'licenses/by-sa' },
  cc0: { name: 'CC0', path: 'publicdomain/zero' },
}

/**
 * The license as a credit line names it, or null when the line shouldn't name one (#405). The
 * version comes from the license link when it points at that same license
 * (`https://creativecommons.org/licenses/by-sa/2.0/` gives "CC BY-SA 2.0"); a link to another
 * license adds none.
 */
export function toLicenseName(
  license: string | null | undefined,
  licenseUrl: string | null | undefined,
): string | null {
  const cc = license ? CC_LICENSES[license as MediaLicense] : undefined
  if (!cc) return null
  const version = licenseUrl?.match(
    new RegExp(`^https?://(?:www\\.)?creativecommons\\.org/${cc.path}/(\\d+\\.\\d+)(?:/|$)`, 'i'),
  )
  return version ? `${cc.name} ${version[1]}` : cc.name
}
