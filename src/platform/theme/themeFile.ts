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

const COMMENT = /\/\*[\s\S]*?\*\//g

function readDeclarations(body: string): TokenValues {
  const values: TokenValues = {}
  for (const [, name, value] of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    values[name] = value.trim()
  }
  return values
}

export function readThemeModes(css: string): ThemeModes {
  // Comments first: a commented-out block is ignored by the browser, so it must not count
  const stylesheet = css.replace(COMMENT, '')
  const light = LIGHT_BLOCK.exec(stylesheet)
  const dark = DARK_BLOCK.exec(stylesheet)
  if (!light) throw new Error("The theme has no light block (:root, [data-theme='light'])")
  if (!dark) throw new Error("The theme has no dark block ([data-theme='dark'])")
  const lightValues = readDeclarations(light[1])
  const darkOwn = readDeclarations(dark[1])
  return { light: lightValues, dark: { ...lightValues, ...darkOwn }, darkOwn }
}

type Rgb = [number, number, number]

function hexToRgb(hex: string): Rgb {
  const match = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!match) throw new Error(`Contrast needs a 6-digit hex colour, got "${hex}"`)
  return [0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), 16) / 255) as Rgb
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const fromLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// sRGB to Oklab and back (Björn Ottosson's matrices), as Tailwind's `/N` opacity mixes in oklab
function toOklab(rgb: Rgb): Rgb {
  const [r, g, b] = rgb.map(toLinear)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function fromOklab([L, a, b]: Rgb): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const linear: Rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  return linear.map((c) => Math.min(1, Math.max(0, fromLinear(c)))) as Rgb
}

/** `color` at `alpha` over `background`, mixed in oklab, as a 6-digit hex colour. */
export function mixOver(color: string, background: string, alpha: number): string {
  const top = toOklab(hexToRgb(color))
  const base = toOklab(hexToRgb(background))
  const mixed = fromOklab(base.map((c, i) => c + (top[i] - c) * alpha) as Rgb)
  return `#${mixed
    .map((c) =>
      Math.round(c * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

/** WCAG 2.x contrast ratio between two 6-digit hex colours. */
export function contrastRatio(a: string, b: string): number {
  const [darker, lighter] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => x - y)
  return (lighter + 0.05) / (darker + 0.05)
}
