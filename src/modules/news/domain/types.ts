import type { ImageRef, RichTextValue } from '@/platform/lib'

/** A category a post belongs to, as cards and the post hero name it. */
export type PostCategory = {
  id: number
  title: string
}

/** What a post card or sidebar item shows. */
export type PostSummary = {
  id: number
  slug: string
  title: string
  publishedAt: string | null
  categories: PostCategory[]
  /** The search-engine description, which cards also show as the post's summary */
  description: string | null
  /** The share image, which cards also use */
  image: ImageRef | null
}

/** Everything the post page shows, including its search-engine fields. */
export type PostDetail = PostSummary & {
  heroImage: ImageRef | null
  content: RichTextValue
  /** Author names, in the order editors set them */
  authors: string[]
  /** The related posts the reader may see, in the order editors set them */
  relatedPosts: PostSummary[]
  createdAt: string
  updatedAt: string
  meta: {
    title: string | null
    description: string | null
    image: ImageRef | null
  }
}

/** A published post's address and last edit, for static pages and the sitemap. */
export type PostSitemapEntry = {
  slug: string
  updatedAt: string
}
