const STATS = [
  { icon: '🏡', label: 'Established', value: '2006' },
  { icon: '📍', label: 'Location', value: 'Far East Side' },
  { icon: '🌳', label: 'Community', value: 'Door Creek Area' },
  { icon: '🤝', label: 'Membership', value: 'Free & Optional' },
]

export function FeatureStrip() {
  return (
    <section className="bg-primary py-5 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4 md:text-left">
          {STATS.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 md:flex-row md:items-start md:gap-3"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="text-xs tracking-wide text-white/60 uppercase">{item.label}</div>
                <div className="text-sm font-semibold text-white">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
