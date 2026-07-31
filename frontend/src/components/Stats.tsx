import { useEffect } from 'react'
import { useStore } from '../hooks/useStore.js'

export default function Stats() {
  const { stats, fetchStats } = useStore()

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [fetchStats])

  const statsItems = [
    {
      value: stats ? stats.total_requests.toLocaleString() : '0',
      label: 'Requests Routed'
    },
    {
      value: stats ? `$${parseFloat(stats.total_usdc_volume).toFixed(2)}` : '$0.00',
      label: 'USDC Volume'
    },
    {
      value: '99.99%',
      label: 'Router Uptime'
    },
    {
      value: stats ? `${stats.provider_stats.length}` : '3',
      label: 'AI Providers'
    }
  ]

  return (
    <section className="py-16 bg-brand-black select-none">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statsItems.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-5xl font-black text-white mb-2 font-sans tracking-tight">
                {stat.value}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-gray-500 font-bold font-sans">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
