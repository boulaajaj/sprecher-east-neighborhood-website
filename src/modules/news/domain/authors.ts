/**
 * A post's byline: "Ana", "Ana and Ben", "Ana, Ben and Cy" (no serial comma), or an empty
 * string when there are no names.
 */
export function formatAuthors(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? ''

  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}
