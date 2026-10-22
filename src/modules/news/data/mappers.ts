import 'server-only'

import type { ArchiveBlock, Post } from '@/payload-types'
import type { ImageRef } from '@/platform/lib'

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

/** An upload field holds the image once loaded (`depth` ≥ 1), and only its id otherwise. */
function toImage(value: Post['heroImage']): ImageRef | null {
  return typeof value === 'object' ? value : null
}

/** The loaded categories; a category that is only an id (not loaded) is left out. */
function toCategories(values: Post['categories']): PostCategory[] {
  return (values ?? []).flatMap((category) =>
    typeof category === 'object'
      ? [{ id: category.id, title: category.title || 'Untitled category' }]
      : [],
  )
}

/** A post document as a card or sidebar item shows it. */
export function toPostSummary(doc: SummaryDoc): PostSummary {
  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    publishedAt: doc.publishedAt ?? null,
    categories: toCategories(doc.categories),
    description: doc.meta?.description ?? null,
    image: toImage(doc.meta?.image),
  }
}

/**
 * A post document as its own page shows it. Related posts the reader may not see come back
 * from Payload as ids only, so only the loaded ones are kept.
 */
export function toPostDetail(doc: Post): PostDetail {
  return {
    ...toPostSummary(doc),
    heroImage: toImage(doc.heroImage),
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
      image: toImage(doc.meta?.image),
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
