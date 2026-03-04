'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

interface Props {
  hasHeroImage: boolean
}

const PageClient: React.FC<Props> = ({ hasHeroImage }) => {
  /* Force the header to be dark mode when the event has a hero image behind it */
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    if (hasHeroImage) {
      setHeaderTheme('dark')
    }
  }, [hasHeroImage, setHeaderTheme])

  return <React.Fragment />
}

export default PageClient
