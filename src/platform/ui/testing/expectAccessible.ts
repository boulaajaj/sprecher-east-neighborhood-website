import axe from 'axe-core'
import { expect } from 'vitest'

/**
 * Runs axe on a rendered component and fails with the rule IDs it breaks. Contrast isn't checked:
 * jsdom has no layout or computed colours, so contrast is measured in the visual review.
 */
export async function expectAccessible(container: Element) {
  const { violations } = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  })
  expect(violations.map(({ id, help }) => `${id}: ${help}`)).toEqual([])
}
