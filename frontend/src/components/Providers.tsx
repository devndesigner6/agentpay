import { useStore } from '../hooks/useStore.js'
import { LogoMarquee } from './ui/logo-marquee.js'

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
      logo: '/logos/openrouter.svg',
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
      logo: '/logos/nvidia.svg',
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
      logo: '/logos/google.svg',
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

  const marqueeLogos = [
    { 
      id: 'openai', 
      label: 'OpenAI',
      mark: (
        <span className="flex items-center gap-2">
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@v14/icons/openai.svg" className="w-4 h-4 opacity-50 grayscale hover:grayscale-0 transition-all dark:invert" alt="OpenAI" />
          <span className="font-bold text-slate-800 font-sans">OpenAI</span>
        </span>
      )
    },
    { 
      id: 'google', 
      label: 'Google Gemini',
      mark: (
        <span className="flex items-center gap-2">
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@v14/icons/google.svg" className="w-4 h-4 opacity-50 grayscale hover:grayscale-0 transition-all" alt="Google" />
          <span className="font-bold text-slate-800 font-sans">Google Gemini</span>
        </span>
      )
    },
    { 
      id: 'meta', 
      label: 'Meta Llama',
      mark: (
        <span className="flex items-center gap-2">
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@v14/icons/meta.svg" className="w-4 h-4 opacity-50 grayscale hover:grayscale-0 transition-all" alt="Meta" />
          <span className="font-bold text-slate-800 font-sans">Meta Llama</span>
        </span>
      )
    },
    { 
      id: 'anthropic', 
      label: 'Anthropic Claude',
      mark: (
        <span className="flex items-center gap-2">
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@v14/icons/anthropic.svg" className="w-4 h-4 opacity-50 grayscale hover:grayscale-0 transition-all" alt="Anthropic" />
          <span className="font-bold text-slate-800 font-sans">Anthropic Claude</span>
        </span>
      )
    },
    { 
      id: 'mistral', 
      label: 'Mistral AI',
      mark: (
        <span className="flex items-center gap-2">
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@v14/icons/mistral.svg" className="w-4 h-4 opacity-50 grayscale hover:grayscale-0 transition-all" alt="Mistral" />
          <span className="font-bold text-slate-800 font-sans">Mistral AI</span>
        </span>
      )
    },
    { 
      id: 'cohere', 
      label: 'Cohere',
      mark: (
        <span className="flex items-center gap-2">
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@v14/icons/cohere.svg" className="w-4 h-4 opacity-50 grayscale hover:grayscale-0 transition-all" alt="Cohere" />
          <span className="font-bold text-slate-800 font-sans">Cohere</span>
        </span>
      )
    },
  ]

  return (
    <div id="models">
      <section className="py-16 bg-[#fafafa] border-t border-[#eaeaea] select-none">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-sans uppercase tracking-wider">
                Featured Models
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Active payment routed models across Algorand Testnet
              </p>
            </div>
            
            <a href="#models" className="text-xs font-bold text-slate-500 hover:text-[#0047ff] flex items-center gap-1 font-sans transition-all">
              View all
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
 
          {/* Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {providers.map((provider, i) => (
              <div
                key={i}
                className="bg-white border border-[#eaeaea] rounded-xl p-5 hover:border-slate-300 transition-all shadow-2xs flex flex-col justify-between min-h-[170px]"
              >
                {/* Logo & Header */}
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-10 h-10 bg-slate-50 border border-[#eaeaea] rounded-lg flex items-center justify-center">
                    <img src={provider.logo} alt={`${provider.creator} logo`} className="w-5 h-5 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 font-sans">{provider.name}</h3>
                    <p className="text-[10px] text-slate-400 font-sans font-semibold mt-0.5">{provider.creator}</p>
                  </div>
                </div>

                {/* Tokens & Trends stats */}
                <div className="flex justify-between border-t border-[#eaeaea] pt-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1 font-sans">
                      Request Cost
                    </span>
                    <span className="text-xs text-slate-700 font-bold font-mono">
                      {provider.price}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1 font-sans">
                      Availability
                    </span>
                    <span className="text-xs text-slate-700 font-bold font-mono">
                      {provider.availability}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1 font-sans">
                      Weekly Trend
                    </span>
                    <span className={`text-xs font-bold font-mono ${provider.trendUp ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {provider.weeklyTrend}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Marquee for routing endpoints */}
          <div className="mt-12">
            <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Supported APIs & Networks
            </p>
            <LogoMarquee
              items={marqueeLogos}
              label="Providers"
              speed={30}
              gap={50}
              direction="left"
              className="border border-[#eaeaea] bg-white rounded-xl shadow-2xs py-4"
            />
          </div>

        </div>
      </section>
    </div>
  )
}
