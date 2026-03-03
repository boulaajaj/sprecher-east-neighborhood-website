import Link from 'next/link'
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
      <Link
        href={buttonHref}
        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        {buttonLabel}
      </Link>
    </div>
  )
}
