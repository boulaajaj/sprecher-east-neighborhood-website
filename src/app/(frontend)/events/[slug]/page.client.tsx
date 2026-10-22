'use client'
import { useHeaderTheme } from '@/platform/theme/HeaderThemeProvider.client'
import React, { useEffect } from 'react'

interface Props {
  hasHeroImage: boolean
}

const PageClient: React.FC<Props> = ({ hasHeroImage }) => {
  /* Force the header to be dark mode when the event has a hero image behind it */
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme(hasHeroImage ? 'dark' : null)
  }, [hasHeroImage, setHeaderTheme])

  return <React.Fragment />
}

export default PageClient
