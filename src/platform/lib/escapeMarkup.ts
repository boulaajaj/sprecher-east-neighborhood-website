const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Text made safe to place inside HTML or XML, including attribute values. */
export const escapeMarkup = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => ENTITIES[char] ?? char)
