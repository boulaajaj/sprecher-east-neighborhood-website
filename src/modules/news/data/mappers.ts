import 'server-only'

import type { ArchiveBlock, Post, Search } from '@/payload-types'
import { documentHref } from '@/platform/payload/documentHref'
import { toImageRef } from '@/platform/payload/imageRef'

import type { PostCategory, PostDetail, PostSummary } from '../domain/types'

/** The fields `toPostSummary` reads; queries for summaries select exactly these. */
export const SUMMARY_FIELDS = {
  title: true,
  slug: true,
  categories: true,
  publishedAt: true,
  meta: true,
} as const

type SummaryDoc = Pick<Post, 'id' | keyof typeof SUMMARY_FIELDS>

const toCategory = (id: number, title: string | null | undefined): PostCategory => ({
  id,
  title: title || 'Untitled category',
})

/** The loaded categories; a category that is only an id (not loaded) is left out. */
function toCategories(values: Post['categories']): PostCategory[] {
  return (values ?? []).flatMap((category) =>
    typeof category === 'object' ? [toCategory(category.id, category.title)] : [],
  )
}

/** A post document as a card or sidebar item shows it. */
export function toPostSummary(doc: SummaryDoc): PostSummary {
  return {
    id: doc.id,
    slug: doc.slug,
    href: documentHref('posts', doc.slug),
    title: doc.title,
    publishedAt: doc.publishedAt ?? null,
    categories: toCategories(doc.categories),
    description: doc.meta?.description ?? null,
    image: toImageRef(doc.meta?.image),
  }
}

/**
 * A post document as its own page shows it. Related posts the reader may not see come back
 * from Payload as ids only, so only the loaded ones are kept.
 */
export function toPostDetail(doc: Post): PostDetail {
  return {
    ...toPostSummary(doc),
    heroImage: toImageRef(doc.heroImage),
    content: doc.content,
    authors: (doc.populatedAuthors ?? []).flatMap(({ name }) => (name ? [name] : [])),
    relatedPosts: (doc.relatedPosts ?? []).flatMap((related) =>
      typeof related === 'object' ? [toPostSummary(related)] : [],
    ),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    meta: {
      title: doc.meta?.title ?? null,
      description: doc.meta?.description ?? null,
      image: toImageRef(doc.meta?.image),
    },
  }
}

/** The ids of a relationship to categories, whether each category is loaded or not. */
export function toCategoryIds(values: ArchiveBlock['categories'] | undefined): number[] {
  return (values ?? []).map((category) => (typeof category === 'object' ? category.id : category))
}

/** The posts an editor picked for an archive block, leaving out those the reader may not see. */
export function toPickedPosts(selected: ArchiveBlock['selectedDocs'] | undefined): PostSummary[] {
  return (selected ?? []).flatMap(({ value }) =>
    typeof value === 'object' ? [toPostSummary(value)] : [],
  )
}

/** The fields `toSearchResult` reads; the search query selects exactly these. */
export const SEARCH_RESULT_FIELDS = {
  doc: true,
  title: true,
  slug: true,
  categories: true,
  meta: true,
} as const

/**
 * A search entry (a post or an event, as the search plugin copied it) as a post card shows it,
 * linking to the post's or the event's own page (#200). The entry keeps no date, and its
 * categories are copies with the category's id as text. An entry without a slug has no page to
 * link to, so it gives `null`.
 */
export function toSearchResult(
  doc: Pick<Search, 'id' | keyof typeof SEARCH_RESULT_FIELDS>,
): PostSummary | null {
  if (!doc.slug) return null
  return {
    // The search entry's id, not a post's: the entry may be an event (#200). Don't use it to
    // exclude or deduplicate posts.
    id: doc.id,
    slug: doc.slug,
    href: documentHref(doc.doc.relationTo, doc.slug),
    title: doc.title ?? '',
    publishedAt: null,
    categories: (doc.categories ?? []).map(({ categoryID, title }) =>
      toCategory(Number(categoryID), title),
    ),
    description: doc.meta?.description ?? null,
    image: toImageRef(doc.meta?.image),
  }
}
