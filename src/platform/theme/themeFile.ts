/**
 * Reads a theme file (`src/themes/<name>/theme.css`) for the contract test (#146). A theme sets
 * its tokens in two blocks: light (`:root, [data-theme='light']`) and dark
 * (`[data-theme='dark']`). Dark inherits what it leaves out, as the browser does.
 */

type TokenValues = Record<string, string>

export interface ThemeModes {
  light: TokenValues
  /** Light values overridden by dark's: what the browser uses in dark mode. */
  dark: TokenValues
  /** Only what the dark block sets itself. */
  darkOwn: TokenValues
}

const LIGHT_BLOCK = /:root\s*,\s*\[data-theme='light'\]\s*\{([^}]*)\}/
const DARK_BLOCK = /(?:^|\n)\[data-theme='dark'\]\s*\{([^}]*)\}/

function readDeclarations(body: string): TokenValues {
  const values: TokenValues = {}
  const withoutComments = body.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const [, name, value] of withoutComments.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    values[name] = value.trim()
  }
  return values
}

export function readThemeModes(css: string): ThemeModes {
  const light = LIGHT_BLOCK.exec(css)
  const dark = DARK_BLOCK.exec(css)
  if (!light) throw new Error("The theme has no light block (:root, [data-theme='light'])")
  if (!dark) throw new Error("The theme has no dark block ([data-theme='dark'])")
  const lightValues = readDeclarations(light[1])
  const darkOwn = readDeclarations(dark[1])
  return { light: lightValues, dark: { ...lightValues, ...darkOwn }, darkOwn }
}

function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!match) throw new Error(`Contrast needs a 6-digit hex colour, got "${hex}"`)
  const channels = [0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), 16) / 255)
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 2.x contrast ratio between two 6-digit hex colours. */
export function contrastRatio(a: string, b: string): number {
  const [darker, lighter] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => x - y)
  return (lighter + 0.05) / (darker + 0.05)
}
