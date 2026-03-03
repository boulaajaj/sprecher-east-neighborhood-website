'use client'

import React, { createContext, useCallback, useEffect, useState, use } from 'react'

import type { Theme, ThemeContextType } from './types'
import { defaultTheme, getImplicitPreference, themeLocalStorageKey } from './shared'
import { themeIsValid } from './types'

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: undefined,
}

const ThemeContext = createContext(initialContext)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme | undefined>(undefined)

  const setTheme = useCallback((themeToSet: Theme | null) => {
    if (themeToSet === null) {
      // "Auto" — remove override, use system preference
      window.localStorage.removeItem(themeLocalStorageKey)
      const implicitPreference = getImplicitPreference()
      const resolved = implicitPreference || defaultTheme
      document.documentElement.setAttribute('data-theme', resolved)
      setThemeState(resolved)
    } else {
      window.localStorage.setItem(themeLocalStorageKey, themeToSet)
      document.documentElement.setAttribute('data-theme', themeToSet)
      setThemeState(themeToSet)
    }
  }, [])

  useEffect(() => {
    // On mount, read the theme already set by InitTheme script
    const stored = window.localStorage.getItem(themeLocalStorageKey)
    if (themeIsValid(stored)) {
      setThemeState(stored)
    } else {
      const implicitPreference = getImplicitPreference()
      setThemeState(implicitPreference || defaultTheme)
    }
  }, [])

  // Listen for system preference changes when no user override is set
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const stored = window.localStorage.getItem(themeLocalStorageKey)
      if (!stored) {
        // No user override — follow system
        const newTheme = mediaQuery.matches ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', newTheme)
        setThemeState(newTheme)
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return <ThemeContext value={{ setTheme, theme }}>{children}</ThemeContext>
}

export const useTheme = (): ThemeContextType => use(ThemeContext)
