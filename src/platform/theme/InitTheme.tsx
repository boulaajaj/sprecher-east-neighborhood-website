import React from 'react'
import Script from 'next/script'

import { defaultTheme, themeLocalStorageKey } from './theme'

/**
 * Sets `data-theme` on <html> before first paint to avoid flash of wrong theme.
 * Runs as a blocking inline script so the correct theme is applied immediately.
 */
export const InitTheme: React.FC = () => {
  return (
    // The rule predates the App Router: there, beforeInteractive belongs in the root layout, which
    // is where this renders (app/(frontend)/layout.tsx)
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      dangerouslySetInnerHTML={{
        __html: `
  (function() {
    var key = ${JSON.stringify(themeLocalStorageKey)};
    var defaultTheme = ${JSON.stringify(defaultTheme)};
    var stored = null;
    try { stored = localStorage.getItem(key); } catch(e) {}
    if (stored === 'dark' || stored === 'light') {
      document.documentElement.setAttribute('data-theme', stored);
    } else {
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : defaultTheme);
    }
  })();
`,
      }}
      id="theme-init"
      strategy="beforeInteractive"
    />
  )
}
