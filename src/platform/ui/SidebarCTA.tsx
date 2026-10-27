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
      <Text variant="small" className="mb-4">
        {description}
      </Text>
      <Button href={buttonHref} size="sm">
        {buttonLabel}
      </Button>
    </Card>
  )
}
