/** A category an event belongs to, from the category tree it shares with posts (#362). */
export type EventCategoryRef = {
  id: number
  title: string
}

/** How an event's categories are named in one line, for example "Parks, Volunteer". */
export function formatEventCategories(categories: readonly EventCategoryRef[]): string {
  return categories.map(({ title }) => title).join(', ')
}
