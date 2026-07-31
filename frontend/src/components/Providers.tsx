import { useStore } from '../hooks/useStore.js'

export default function Providers() {
  const { stats } = useStore()
  
  const defaultProviders = [
    {
      id: 'cheap-llm',
      name: 'Llama 3.2 (3B)',
      creator: 'by Meta',
      price: '$0.005',
      latency: '280ms',
      availability: '98%',
      logo: '🦙',
      weeklyTrend: '+12%',
      trendUp: true,
      volume: '154.2M'
    },
    {
      id: 'premium-ai',
      name: 'Gemini 2 Flash',
      creator: 'by Google',
      price: '$0.020',
      latency: '180ms',
      availability: '99%',
      logo: '✨',
      weeklyTrend: '-4%',
      trendUp: false,
      volume: '497.5M'
    },
    {
      id: 'balanced-ai',
      name: 'Mistral 7B',
      creator: 'by Mistral',
      price: '$0.010',
      latency: '220ms',
      availability: '97%',
      logo: '🌀',
      weeklyTrend: '+24%',
      trendUp: true,
      volume: '81.7M'
    },
  ]

  const providers = defaultProviders.map(p => {
    const live = stats?.provider_stats.find(l => l.id === p.id)
    if (live) {
      return {
        ...p,
        latency: `${live.avg_latency}ms`,
        availability: `${(live.availability * 100).toFixed(1)}%`
      }
    }
    return p
  })

  return (
    <div id="models">
      <section className="py-16 bg-brand-black border-t border-brand-border select-none">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-1.5 font-sans">
                Featured Models
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </h2>
              <p className="text-xs text-gray-500 font-sans mt-0.5">
                Active payment routed models across Algorand
              </p>
            </div>
            
            <a href="#models" className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-sans transition-all">
              View all
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {providers.map((provider, i) => (
              <div
                key={i}
                className="bg-brand-navy border border-brand-border rounded-xl p-5 hover:border-zinc-700 transition-all shadow-md flex flex-col justify-between min-h-[170px]"
              >
                {/* Logo & Header */}
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-10 h-10 bg-zinc-900 border border-brand-border rounded-lg flex items-center justify-center text-xl">
                    {provider.logo}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans">{provider.name}</h3>
                    <p className="text-[10px] text-gray-500 font-sans font-medium">{provider.creator}</p>
                  </div>
                </div>

                {/* Tokens & Trends stats */}
                <div className="flex justify-between border-t border-brand-border/60 pt-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold block mb-1 font-sans">
                      Request Cost
                    </span>
                    <span className="text-xs text-white font-bold font-mono">
                      {provider.price}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold block mb-1 font-sans">
                      Availability
                    </span>
                    <span className="text-xs text-white font-bold font-mono">
                      {provider.availability}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold block mb-1 font-sans">
                      Weekly Trend
                    </span>
                    <span className={`text-xs font-bold font-mono ${provider.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                      {provider.weeklyTrend}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  )
}
