'use client'

import React from 'react'

import { Field } from '@/platform/ui'
import { useTheme } from './ThemeProvider.client'
import { themeLocalStorageKey } from './theme'

const THEME_OPTIONS = [
  { label: 'Auto', value: 'auto' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
] as const

type ThemeOption = (typeof THEME_OPTIONS)[number]['value']

const isThemeOption = (value: string): value is ThemeOption =>
  THEME_OPTIONS.some((option) => option.value === value)

// Not rendered anywhere yet (docs/ui/evidence.md); kept working on the shared Field
export const ThemeSelector: React.FC = () => {
  const { setTheme } = useTheme()

  // Determine current value: if localStorage has an override use it, otherwise 'auto'
  const [value, setValue] = React.useState<ThemeOption>('auto')

  React.useEffect(() => {
    const stored = window.localStorage.getItem(themeLocalStorageKey)
    setValue(stored === 'dark' || stored === 'light' ? stored : 'auto')
  }, [])

  const handleChange = (newValue: string) => {
    if (!isThemeOption(newValue)) return
    setValue(newValue)
    setTheme(newValue === 'auto' ? null : newValue) // null = follow system
  }

  return (
    <Field label="Theme" hideLabel>
      <Field.Select options={THEME_OPTIONS} value={value} onValueChange={handleChange} />
    </Field>
  )
}
