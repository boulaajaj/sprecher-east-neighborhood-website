/*
 * The colors of a whole's slices, in one place so a bar and the line a nested row sets under its slice can
 * never differ (#1111, #1196): the City's slice in the theme's solid green and the others in three neutral tones,
 * the lightest first. Each tone has the bar's fill and the color of that line (`edge`).
 */
export const SHARE_TONES = {
  highlight: {
    fill: 'fill-primary-fill',
    edge: 'border-primary-fill',
  },
  strong: {
    fill: 'fill-muted-foreground/45',
    edge: 'border-muted-foreground/45',
  },
  medium: {
    fill: 'fill-muted-foreground/30',
    edge: 'border-muted-foreground/30',
  },
  light: {
    fill: 'fill-muted-foreground/18',
    edge: 'border-muted-foreground/18',
  },
} as const

export type ShareTone = keyof typeof SHARE_TONES
