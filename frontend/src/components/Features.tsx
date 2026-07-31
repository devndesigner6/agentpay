export default function Features() {
  const cards = [
    {
      title: 'One API for Any Model',
      description: 'Access all major models through a single, unified interface. OpenAI SDK works out of the box.',
      linkText: 'Browse all',
      linkUrl: '#models',
      logos: ['🤖', '⚡', '⭐', '🧠'] // Representing providers
    },
    {
      title: 'Higher Availability',
      description: 'Reliable AI models via our distributed infrastructure. Fall back to other providers when one goes down.',
      linkText: 'Learn more',
      linkUrl: '#routing',
      logos: ['🟢', '🔵', '🟣']
    },
    {
      title: 'Price and Performance',
      description: 'Keep costs in check without sacrificing speed. OpenRouter runs at the edge for minimal latency between your users and their inference.',
      linkText: 'Learn more',
      linkUrl: '#pricing',
      logos: ['📈', '🚀']
    },
    {
      title: 'Custom Data Policies',
      description: 'Protect your organization with fine-grained data policies. Ensure prompts only go to the models and providers you trust.',
      linkText: 'View docs',
      linkUrl: '#docs',
      logos: ['🔒', '📝']
    }
  ]

  return (
    <section className="py-16 bg-brand-black border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <div
              key={i}
              className="bg-brand-navy border border-brand-border rounded-xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-all group min-h-[260px] shadow-lg"
            >
              <div>
                {/* Floating Indicators / Logos */}
                <div className="flex gap-2 mb-6 select-none">
                  {card.logos.map((logo, idx) => (
                    <span
                      key={idx}
                      className="w-7 h-7 bg-zinc-900 border border-brand-border rounded-lg flex items-center justify-center text-xs group-hover:scale-105 transition-transform"
                    >
                      {logo}
                    </span>
                  ))}
                </div>

                <h3 className="text-base font-bold text-white mb-2 font-sans">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6 font-sans">
                  {card.description}
                </p>
              </div>

              <div>
                <a
                  href={card.linkUrl}
                  className="text-xs text-gray-300 font-semibold hover:text-white flex items-center gap-1 font-sans transition-all"
                >
                  {card.linkText}
                  <svg className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
