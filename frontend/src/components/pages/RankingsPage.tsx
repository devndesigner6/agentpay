import { useState } from 'react'

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState('text')

  const rankings = [
    { rank: 1, name: 'Gemini 2 Flash', provider: 'by Google', elo: 1254, price: '$0.020', latency: '180ms', mmlu: '88.7%', gsm: '92.4%', code: '84.1%' },
    { rank: 2, name: 'Mistral 7B', provider: 'by Mistral', elo: 1184, price: '$0.010', latency: '220ms', mmlu: '81.4%', gsm: '84.2%', code: '72.3%' },
    { rank: 3, name: 'Llama 3.2 (3B)', provider: 'by Meta', elo: 1045, price: '$0.005', latency: '280ms', mmlu: '68.2%', gsm: '71.5%', code: '54.2%' }
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 font-sans bg-[#fafafa] min-h-screen select-none">
      
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-[#111] mb-2 tracking-tight">Model Rankings</h1>
        <p className="text-xs text-[#666]">Live Elo ratings, latency records, and standardized reasoning benchmarks.</p>
      </div>

      <div className="v5-table-wrapper bg-white">
        {/* Modality Tabs (Alephant tabs secondary) */}
        <div className="bg-white px-5 py-4 border-b border-[#eaeaea] flex items-center justify-between">
          <div className="v5-tabs-secondary">
            {['text', 'image', 'embeddings', 'rerank'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`v5-tab-secondary ${activeTab === tab ? 'active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table grid */}
        <div className="overflow-x-auto">
          <table className="v5-table">
            <thead>
              <tr className="border-b border-[#eaeaea]">
                <th className="v5-th text-center w-12">Rank</th>
                <th className="v5-th">Model Name</th>
                <th className="v5-th text-center">Elo Rating</th>
                <th className="v5-th text-center">USDC Cost</th>
                <th className="v5-th text-center">Avg Latency</th>
                <th className="v5-th text-center">MMLU</th>
                <th className="v5-th text-center">GSM8K</th>
                <th className="v5-th text-center">HumanEval</th>
              </tr>
            </thead>
            <tbody>
              {activeTab !== 'text' ? (
                <tr>
                  <td colSpan={8} className="v5-td text-center text-[#666] italic py-8">
                    No data available for this modality index.
                  </td>
                </tr>
              ) : (
                rankings.map((item) => (
                  <tr key={item.rank} className="v5-tr text-slate-700">
                    <td className="v5-td v5-td-mono text-center font-bold text-slate-400">{item.rank}</td>
                    <td className="v5-td font-bold text-slate-900">
                      <div>{item.name}</div>
                      <div className="text-[10px] text-[#666] font-normal mt-0.5">{item.provider}</div>
                    </td>
                    <td className="v5-td v5-td-mono text-center font-bold text-[#16a34a]">{item.elo}</td>
                    <td className="v5-td v5-td-mono text-center">{item.price}</td>
                    <td className="v5-td v5-td-mono text-center">{item.latency}</td>
                    <td className="v5-td v5-td-mono text-center">{item.mmlu}</td>
                    <td className="v5-td v5-td-mono text-center">{item.gsm}</td>
                    <td className="v5-td v5-td-mono text-center">{item.code}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
