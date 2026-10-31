import { Button } from './Button'
import React from 'react'

import { Card } from './Card'
import { Text } from './Text'

export const SidebarCTA: React.FC<{
  heading: string
  description: string
  buttonLabel: string
  buttonHref: string
}> = ({ heading, description, buttonLabel, buttonHref }) => {
  return (
    <Card variant="tinted">
      <Text variant="subsection" as="h3" className="mb-2">
        {heading}
      </Text>
      {/* Muted text on the tinted card is 4.41:1 in light theme, under AA's 4.5:1 (#216) */}
      <Text variant="small" className="mb-4 text-foreground">
        {description}
      </Text>
      <Button href={buttonHref} size="sm">
        {buttonLabel}
      </Button>
    </Card>
  )
}
