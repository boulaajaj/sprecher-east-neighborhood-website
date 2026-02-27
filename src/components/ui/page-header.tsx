interface PageHeaderProps {
  eyebrow: string
  title: string
  description?: string
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="border-b border-border bg-surface py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">{eyebrow}</p>
        <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">{title}</h1>
        {description && (
          <p className="max-w-2xl text-lg leading-relaxed text-muted">{description}</p>
        )}
      </div>
    </header>
  )
}
