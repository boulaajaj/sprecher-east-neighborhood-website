interface PageHeaderProps {
  eyebrow: string
  title: string
  description?: string
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="bg-surface border-b border-border py-14 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">{eyebrow}</p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{title}</h1>
        {description && (
          <p className="text-muted text-lg max-w-2xl leading-relaxed">{description}</p>
        )}
      </div>
    </header>
  )
}
