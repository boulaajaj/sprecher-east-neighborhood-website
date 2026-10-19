import type { Metadata } from 'next'

import type { Media, Page, Post, Event, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { toAbsoluteURL } from './getURL'

/** The CMS slug for the homepage — used to map /home → / in URLs */
export const HOME_PAGE_SLUG = 'home'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  if (image && typeof image === 'object' && 'url' in image) {
    const url = image.sizes?.og?.url || image.url
    if (url) return toAbsoluteURL(url)
  }

  return toAbsoluteURL('/images/photo.jpeg')
}

type DocWithMeta = Partial<Page> | Partial<Post> | Partial<Event>

export const generateMeta = async (args: { doc: DocWithMeta | null }): Promise<Metadata> => {
  const { doc } = args

  const meta = doc?.meta

  // meta.image is added by the SEO plugin but missing from Payload's generated types
  const ogImage = getImageURL((meta as Record<string, unknown> | undefined)?.image as Media | null)

  const title = meta?.title || 'Sprecher East'

  return {
    description: meta?.description,
    openGraph: mergeOpenGraph({
      description: meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url:
        typeof doc?.slug === 'string' ? (doc.slug === HOME_PAGE_SLUG ? '/' : `/${doc.slug}`) : '/',
    }),
    title,
  }
}
