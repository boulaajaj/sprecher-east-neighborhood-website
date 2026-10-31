import 'server-only'

import { documentHref } from '@/platform/payload/documentHref'

import { getDocumentById } from '../data/documents'
import { listRedirects } from '../data/redirects'

/**
 * Where a request for `url` goes, from the redirects editors set: the custom URL, or the address
 * of the page or post it points at. `null` when no redirect starts at `url`, or when its target
 * isn't published, so a redirect never reveals a draft.
 */
export async function getRedirectTarget(url: string): Promise<string | null> {
  const redirects = await listRedirects()
  const redirect = redirects.find(({ from }) => from === url)
  if (!redirect) return null

  if (redirect.to?.url) return redirect.to.url

  const reference = redirect.to?.reference
  if (!reference) return null

  // An unpopulated reference is an ID: look it up as a visitor would (null for a draft)
  const target =
    typeof reference.value === 'number'
      ? await getDocumentById(reference.relationTo, reference.value)
      : reference.value

  return target?.slug ? documentHref(reference.relationTo, target.slug) : null
}
