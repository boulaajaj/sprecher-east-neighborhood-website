'use client'

import React from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'

import { useTheme } from '@/providers/Theme'
import { themeLocalStorageKey } from '@/providers/Theme/shared'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ThemeOption = 'auto' | 'light' | 'dark'

const icons: Record<ThemeOption, React.ReactNode> = {
  auto: <Monitor className="size-4" />,
  light: <Sun className="size-4" />,
  dark: <Moon className="size-4" />,
}

export const ThemeSelector: React.FC = () => {
  const { setTheme } = useTheme()

  // Determine current value: if localStorage has an override use it, otherwise 'auto'
  const [value, setValue] = React.useState<ThemeOption>('auto')

  React.useEffect(() => {
    const stored = window.localStorage.getItem(themeLocalStorageKey)
    if (stored === 'dark' || stored === 'light') {
      setValue(stored)
    } else {
      setValue('auto')
    }
  }, [])

  const handleChange = (newValue: ThemeOption) => {
    setValue(newValue)
    if (newValue === 'auto') {
      setTheme(null) // null = follow system
    } else {
      setTheme(newValue)
    }
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger
        aria-label="Select theme"
        className="w-auto gap-2 border-none bg-transparent pl-0 shadow-none md:pl-3"
      >
        {icons[value]}
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="auto">
          <span className="flex items-center gap-2">
            <Monitor className="size-4" />
            Auto
          </span>
        </SelectItem>
        <SelectItem value="light">
          <span className="flex items-center gap-2">
            <Sun className="size-4" />
            Light
          </span>
        </SelectItem>
        <SelectItem value="dark">
          <span className="flex items-center gap-2">
            <Moon className="size-4" />
            Dark
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
