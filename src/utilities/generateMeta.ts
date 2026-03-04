import type { Metadata } from 'next'

import type { Media, Page, Post, Event, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/images/photo.jpeg'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

type DocWithMeta = Partial<Page> | Partial<Post> | Partial<Event>

export const generateMeta = async (args: { doc: DocWithMeta | null }): Promise<Metadata> => {
  const { doc } = args

  const meta = doc?.meta

  const ogImage = getImageURL(meta?.image)

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
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}
