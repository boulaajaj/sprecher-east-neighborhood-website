import type { Theme } from './types'

export const themeLocalStorageKey = 'payload-theme'

export const defaultTheme = 'light'

export const getImplicitPreference = (): Theme | null => {
  const mediaQuery = '(prefers-color-scheme: dark)'
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mql = window.matchMedia(mediaQuery)
    if (mql.matches) return 'dark'
    // If the browser does not prefer dark, treat it as preferring light
    return 'light'
  }
  return null
}
