const STATS = [
  { icon: '🏡', label: 'Established', value: '2006' },
  { icon: '📍', label: 'Location', value: 'Far East Side' },
  { icon: '🌳', label: 'Community', value: 'Door Creek Area' },
  { icon: '🤝', label: 'Membership', value: 'Free & Optional' },
]

export function FeatureStrip() {
  return (
    <section className="bg-primary text-white py-5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          {STATS.map((item) => (
            <div key={item.label} className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="text-white/60 text-xs uppercase tracking-wide">{item.label}</div>
                <div className="text-white font-semibold text-sm">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
