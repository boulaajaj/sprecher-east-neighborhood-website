import { Button } from './Button'
import React from 'react'

import { Card } from './Card'

export const SidebarCTA: React.FC<{
  heading: string
  description: string
  buttonLabel: string
  buttonHref: string
}> = ({ heading, description, buttonLabel, buttonHref }) => {
  return (
    <Card variant="tinted">
      <h3 className="mb-2 text-base font-semibold text-foreground">{heading}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      <Button href={buttonHref} size="sm">
        {buttonLabel}
      </Button>
    </Card>
  )
}
