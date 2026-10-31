import { cva } from 'class-variance-authority'

/**
 * The box every text-like control draws: `Field.Input`, `Field.TextArea` and the trigger of
 * `Field.Select`. 16 px text, so phones don't zoom in on focus; `--input` borders are 3:1 against
 * the page, the card and the surface panel (WCAG 1.4.11).
 */
export const controlVariants = cva(
  'w-full min-w-0 rounded-lg border border-input bg-background text-base text-foreground transition-colors duration-200 placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive-strong',
  {
    variants: {
      // Both are at least 44 px tall (WCAG 2.5.8): md for forms, lg for the search box
      size: {
        md: 'min-h-11 px-3',
        lg: 'min-h-12 px-4',
      },
    },
    defaultVariants: { size: 'md' },
  },
)
