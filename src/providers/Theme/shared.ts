import type { Theme } from './types'

export const themeLocalStorageKey = 'payload-theme'

export const defaultTheme = 'light'

export const getImplicitPreference = (): Theme | null => {
  const mediaQuery = '(prefers-color-scheme: dark)'
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mql = window.matchMedia(mediaQuery)
    if (mql.matches) return 'dark'
    // If the browser supports the query but prefers light, return 'light'
    if (mql.media === mediaQuery) return 'light'
  }
  return null
}
