import type { RichTextValue } from '@/platform/lib'

import type { FaqCategory, ResourceCategory } from './categories'

// Read-only lists the pages show as stored, so these mirror the collections' fields (optional
// fields stay optional) and the queries return them without a mapper (architecture rule 8).

/** A published question and its answer, as the FAQ page shows it. */
export type FaqEntry = {
  id: number
  question: string
  answer: RichTextValue
  /** No category means General */
  category?: FaqCategory | null
}

/** A published entry in the resources directory, as its card shows it. */
export type ResourceSummary = {
  id: number
  title: string
  description?: string | null
  /** Starts with http:// or https:// (`isResourceUrl`) */
  url?: string | null
  phone?: string | null
  category: ResourceCategory
}

/** One heading on the FAQ or resources page: a category, its label and what it holds. */
export type CategorySection<Category extends string, Item> = {
  category: Category
  label: string
  items: Item[]
}
