/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      typography: () => ({
        DEFAULT: {
          css: [
            {
              // Theme tokens, which switch with the site's theme. `dark:prose-invert` follows the
              // device setting instead, so the invert values point at the same tokens (#397)
              '--tw-prose-body': 'var(--foreground)',
              '--tw-prose-headings': 'var(--foreground)',
              '--tw-prose-bullets': 'var(--muted-foreground)',
              '--tw-prose-counters': 'var(--muted-foreground)',
              '--tw-prose-invert-body': 'var(--foreground)',
              '--tw-prose-invert-headings': 'var(--foreground)',
              '--tw-prose-invert-bullets': 'var(--muted-foreground)',
              '--tw-prose-invert-counters': 'var(--muted-foreground)',
              h1: {
                fontWeight: 'normal',
                marginBottom: '0.25em',
              },
            },
          ],
        },
        base: {
          css: [
            {
              h1: {
                fontSize: '2.5rem',
              },
              h2: {
                fontSize: '1.25rem',
                fontWeight: 600,
              },
            },
          ],
        },
        md: {
          css: [
            {
              h1: {
                fontSize: '3.5rem',
              },
              h2: {
                fontSize: '1.5rem',
              },
            },
          ],
        },
      }),
    },
  },
}

export default config
