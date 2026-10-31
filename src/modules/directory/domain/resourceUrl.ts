/** Whether `value` is a web address a resource may link to: it starts with http:// or https://. */
export function isResourceUrl(value: string): boolean {
  return /^https?:\/\//.test(value)
}
