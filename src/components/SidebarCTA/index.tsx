import { Button } from '@/platform/ui'
import React from 'react'

export const SidebarCTA: React.FC<{
  heading: string
  description: string
  buttonLabel: string
  buttonHref: string
}> = ({ heading, description, buttonLabel, buttonHref }) => {
  return (
    <div className="rounded-lg bg-primary/10 p-5">
      <h3 className="mb-2 text-base font-semibold text-foreground">{heading}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      <Button href={buttonHref} size="sm">
        {buttonLabel}
      </Button>
    </div>
  )
}
