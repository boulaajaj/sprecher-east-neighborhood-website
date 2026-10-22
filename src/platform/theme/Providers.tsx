import React from 'react'

import { HeaderThemeProvider } from './HeaderThemeProvider.client'
import { ThemeProvider } from './ThemeProvider.client'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>{children}</HeaderThemeProvider>
    </ThemeProvider>
  )
}
