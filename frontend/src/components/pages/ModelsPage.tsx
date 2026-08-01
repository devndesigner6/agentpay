import { useState } from 'react'
import { useStore } from '../../hooks/useStore.js'

export default function ModelsPage() {
  const { setPage, setChatModel } = useStore()
  const [search, setSearch] = useState('')
  const [modality, setModality] = useState('all')

  const models = [
    {
      id: 'cheap-llm',
      name: 'Laguna XS 2.1 (free)',
      creator: 'by Poolside via OpenRouter',
      description: 'Current free OpenRouter text model for quick, low-cost prompts.',
      price: '$0.005',
      context: '8,192 tokens',
      modality: 'text',
      uptime: '99.8%',
      weeklyTrend: '+12%'
    },
    {
      id: 'balanced-ai',
      name: 'Gemma 4 31B (free)',
      creator: 'by Google via OpenRouter',
      description: 'Current free OpenRouter model balanced for analysis and programming tasks.',
      price: '$0.010',
      context: '131,072 tokens',
      modality: 'text',
      uptime: '99.7%',
      weeklyTrend: '+24%'
    },
    {
      id: 'premium-ai',
      name: 'Nemotron 3 Ultra (free)',
      creator: 'by NVIDIA via OpenRouter',
      description: 'Current free OpenRouter reasoning route for complex analysis and coding.',
      price: '$0.020',
      context: '131,072 tokens',
      modality: 'text',
      uptime: '99.9%',
      weeklyTrend: '-4%'
    }
  ]

  const filteredModels = models.filter((model) => {
    const matchesSearch = model.name.toLowerCase().includes(search.toLowerCase()) || 
                          model.description.toLowerCase().includes(search.toLowerCase())
    const matchesModality = modality === 'all' || model.modality === modality
    return matchesSearch && matchesModality
  })

  const handleStartChat = (modelId: string) => {
    setChatModel(modelId)
    setPage('chat')
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans bg-[#fafafa] min-h-screen select-none">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-[#111] mb-2 tracking-tight">Models</h1>
        <p className="text-xs text-[#666]">Explore AI models routed intelligently by AgentPay with x402 payments.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-8 items-start">
        {/* Left Filter Sidebar */}
        <div className="space-y-6">
          <div className="v5-card p-5 shadow-sm bg-white">
            <h3 className="v5-card-title text-xs uppercase tracking-wider mb-4">Filters</h3>
            
            <div className="space-y-4">
              <div>
                <label className="v5-label text-[10px] uppercase font-bold text-slate-400 block mb-2">Input Modality</label>
                <div className="space-y-2">
                  {[
                    { label: 'All Modalities', value: 'all' },
                    { label: 'Text only', value: 'text' },
                    { label: 'Text + Image', value: 'multimodal' },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-xs text-[#666] hover:text-[#111]">
                      <input
                        type="radio"
                        name="modality"
                        checked={modality === opt.value}
                        onChange={() => setModality(opt.value)}
                        className="accent-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#eaeaea] pt-4">
                <label className="v5-label text-[10px] uppercase font-bold text-slate-400 block mb-2">Uptime Requirements</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#666] hover:text-[#111]">
                    <input type="checkbox" defaultChecked className="rounded accent-blue-600 focus:ring-0 cursor-pointer" />
                    <span>&gt; 99% Uptime</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#666] hover:text-[#111]">
                    <input type="checkbox" className="rounded accent-blue-600 focus:ring-0 cursor-pointer" />
                    <span>&gt; 99.9% Uptime</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Catalog Column */}
        <div className="md:col-span-3 space-y-6">
          {/* Search bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search models..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="v5-input"
              />
            </div>
          </div>

          {/* Catalog grid */}
          <div className="space-y-4">
            {filteredModels.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 italic">No models match your search query.</div>
            ) : (
              filteredModels.map((model) => (
                <div
                  key={model.id}
                  className="v5-card p-5 hover:border-[#d9d9d9] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm bg-white"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <h3 className="text-sm font-bold text-[#111]">{model.name}</h3>
                      <span className="text-[10px] text-[#666] font-medium">{model.creator}</span>
                      <span className="v5-badge v5-badge-brand text-[9px] font-bold">
                        {model.price} / req
                      </span>
                    </div>
                    <p className="text-xs text-[#666] leading-relaxed max-w-2xl">{model.description}</p>
                    
                    <div className="flex gap-4 mt-3 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      <span>Context: <span className="text-[#333] font-mono">{model.context}</span></span>
                      <span>Uptime: <span className="text-[#333] font-mono">{model.uptime}</span></span>
                      <span>Weekly Trend: <span className="text-[#16a34a] font-mono">{model.weeklyTrend}</span></span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartChat(model.id)}
                    className="v5-btn v5-btn-primary rounded-lg text-xs flex items-center gap-1 font-sans flex-shrink-0"
                  >
                    Chat
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
