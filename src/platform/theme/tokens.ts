/**
 * The theme contract (decisions 0006 and 0012, #146): every semantic token a theme defines.
 * Components use only these, through the Tailwind classes `tailwind.css` maps them to
 * (`bg-background`, `text-muted-foreground`, …), never raw colours. A theme is a CSS file under
 * `src/themes/<name>/theme.css` giving each token a value; `themes.test.ts` checks every theme
 * against this list and the contrast pairs below.
 *
 * The names follow shadcn/ui's convention, so shadcn-format themes fit with little translation.
 */

/** `both`: the theme sets it in light and dark. `base`: set once, the same in both modes. */
type Modes = 'both' | 'base'

export const THEME_TOKENS = {
  background: { modes: 'both', meaning: 'Page background' },
  foreground: { modes: 'both', meaning: 'Body text on the background' },
  card: { modes: 'both', meaning: 'Card background' },
  'card-foreground': { modes: 'both', meaning: 'Text on a card' },
  popover: { modes: 'both', meaning: 'Menus, popovers and dialogs' },
  'popover-foreground': { modes: 'both', meaning: 'Text on a popover' },
  primary: { modes: 'both', meaning: 'Brand colour for accents, borders and icons' },
  'primary-foreground': { modes: 'both', meaning: 'Text on a primary fill' },
  'primary-fill': { modes: 'both', meaning: 'Primary button fill, passes AA with its text' },
  'primary-fill-hover': { modes: 'both', meaning: 'Primary button fill on hover' },
  'primary-strong': { modes: 'both', meaning: 'Primary-coloured text that passes on panels' },
  'primary-dark': { modes: 'both', meaning: 'Darker primary shade' },
  'primary-light': { modes: 'both', meaning: 'Lighter primary shade' },
  secondary: { modes: 'both', meaning: 'Secondary surface' },
  'secondary-foreground': { modes: 'both', meaning: 'Text on a secondary surface' },
  muted: { modes: 'both', meaning: 'Muted surface' },
  'muted-foreground': { modes: 'both', meaning: 'Secondary text' },
  accent: { modes: 'both', meaning: 'Highlight colour' },
  'accent-foreground': { modes: 'both', meaning: 'Text on the accent colour' },
  'accent-dark': { modes: 'both', meaning: 'Darker accent shade (hover)' },
  destructive: { modes: 'both', meaning: 'Errors and destructive actions' },
  'destructive-foreground': { modes: 'both', meaning: 'Destructive text (shadcn name)' },
  'destructive-strong': { modes: 'both', meaning: 'Error text that passes on panels' },
  surface: { modes: 'both', meaning: 'Raised panels and alternating sections' },
  border: { modes: 'both', meaning: 'Dividers and card borders' },
  input: { modes: 'both', meaning: 'Form control borders (3:1, WCAG 1.4.11)' },
  ring: { modes: 'both', meaning: 'Focus ring' },
  success: { modes: 'both', meaning: 'Success state' },
  warning: { modes: 'both', meaning: 'Warning state' },
  error: { modes: 'both', meaning: 'Error state' },
  'chart-1': { modes: 'both', meaning: 'Chart series 1' },
  'chart-2': { modes: 'both', meaning: 'Chart series 2' },
  'chart-3': { modes: 'both', meaning: 'Chart series 3' },
  'chart-4': { modes: 'both', meaning: 'Chart series 4' },
  'chart-5': { modes: 'both', meaning: 'Chart series 5' },
  radius: { modes: 'base', meaning: 'Base corner radius; sm to xl derive from it' },
} as const satisfies Record<string, { modes: Modes; meaning: string }>

export type ThemeToken = keyof typeof THEME_TOKENS

export const THEME_TOKEN_NAMES = Object.keys(THEME_TOKENS) as ThemeToken[]

/**
 * Text-on-background pairs every theme must pass at WCAG AA (4.5:1) in both modes. Each pair is
 * one the components actually draw. `primary-foreground` on plain `primary` isn't one: buttons
 * use `primary-fill`, because dark `primary` gives white text only 3.35:1 (#121).
 */
export const CONTRAST_PAIRS: ReadonlyArray<readonly [text: ThemeToken, background: ThemeToken]> = [
  ['foreground', 'background'],
  ['foreground', 'surface'],
  ['card-foreground', 'card'],
  ['popover-foreground', 'popover'],
  ['secondary-foreground', 'secondary'],
  ['muted-foreground', 'background'],
  ['muted-foreground', 'surface'],
  ['muted-foreground', 'card'],
  ['muted-foreground', 'muted'],
  ['primary-foreground', 'primary-fill'],
  ['primary-foreground', 'primary-fill-hover'],
  ['accent-foreground', 'accent'],
  ['primary-strong', 'background'],
  ['primary-strong', 'surface'],
  ['destructive-strong', 'background'],
  ['destructive-strong', 'surface'],
  ['destructive-strong', 'card'],
]

/** WCAG 2.x AA minimum for normal text. */
export const MIN_TEXT_CONTRAST = 4.5
