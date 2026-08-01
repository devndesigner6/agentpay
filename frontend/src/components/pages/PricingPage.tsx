import { TextReveal } from '../ui/text-reveal.js'
import { ShimmerButton } from '../ui/shimmer-button.js'
import { RippleButton } from '../ui/ripple-button.js'

export default function PricingPage() {
  const tiers = [
    {
      name: 'Free Trial',
      price: '$0.00',
      description: 'Perfect for sandbox testing and evaluating AgentPay features.',
      features: ['Simulated Sandbox payments', 'Access to 3 routed models', 'Max 10 prompts/min', 'Local API endpoints access']
    },
    {
      name: 'Pay-As-You-Go',
      price: '$0.03',
      description: 'Agent-native, pay per request. Settle directly with x402 USDC micropayments.',
      features: ['Pera Wallet integration', 'Testnet/Mainnet-ready receipt flow', 'No monthly subscriptions', 'Priority provider routing fallback', 'Usage-based routing'],
      active: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Custom setups for high-volume agent networks and private facilitators.',
      features: ['SLA uptime guarantees', 'Custom local router nodes', 'Dedicated GoPlausible facilitators', 'Volume discounts', '24/7 technical support access']
    }
  ]

  const modelPrices = [
    { name: 'Llama 3.2 (3B)', creator: 'by Meta', promptPrice: '$0.005 / req', completionPrice: '$0.005 / req' },
    { name: 'Mistral 7B', creator: 'by Mistral', promptPrice: '$0.010 / req', completionPrice: '$0.010 / req' },
    { name: 'Gemini 2 Flash', creator: 'by Google', promptPrice: '$0.020 / req', completionPrice: '$0.020 / req' }
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 font-sans bg-[#fafafa] min-h-screen select-none">
      
      {/* Header */}
      <div className="mb-14 text-center">
        <h1 className="text-3xl font-extrabold text-[#111] mb-2 tracking-tight">
          <TextReveal text="Pricing Plans" className="font-bold text-[#111]" stagger={0.06} maxDuration={1.0} />
        </h1>
        <p className="text-xs text-[#666]">Pay only for what your agent uses. Settle micropayments atomically with x402.</p>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`v5-card p-6 flex flex-col justify-between hover:border-[#d9d9d9] transition-all bg-white shadow-sm relative ${
              tier.active ? 'border-blue-600 ring-1 ring-blue-500/20' : ''
            }`}
          >
            {tier.active && (
              <span className="absolute -top-2.5 right-6 v5-badge v5-badge-brand text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide">
                Popular
              </span>
            )}
            
            <div>
              <h3 className="text-sm font-bold text-[#111] mb-1.5">{tier.name}</h3>
              <p className="text-[11px] text-[#666] mb-5 leading-normal">{tier.description}</p>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl font-black text-[#111] font-mono">{tier.price}</span>
                <span className="text-[10px] text-[#666] font-medium">/ request</span>
              </div>

              <ul className="space-y-2.5 border-t border-[#eaeaea] pt-5">
                {tier.features.map((feat) => (
                  <li key={feat} className="text-xs text-[#333] flex items-start gap-2">
                    <span className="text-[#16a34a] font-bold select-none">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {tier.active ? (
              <ShimmerButton
                onClick={() => alert(`Selected ${tier.name}`)}
                shimmerColor="#0047ff"
                background="#000000"
                className="w-full mt-8 py-2.5 text-xs font-bold rounded-lg border-beam"
              >
                Select Plan
              </ShimmerButton>
            ) : (
              <RippleButton
                onClick={() => alert(`Selected ${tier.name}`)}
                rippleColor="rgba(0, 0, 0, 0.05)"
                className="w-full mt-8 py-2.5 text-xs font-bold rounded-lg bg-white border border-[#eaeaea] text-slate-700 hover:bg-slate-50 shadow-2xs"
              >
                Select Plan
              </RippleButton>
            )}
          </div>
        ))}
      </div>

      {/* Detailed Model Rates */}
      <div className="border-t border-[#eaeaea] pt-12 max-w-3xl mx-auto">
        <h2 className="text-sm font-bold text-[#111] mb-6 font-sans select-none">Model Costs Breakdown</h2>
        
        <div className="v5-table-wrapper bg-white shadow-sm">
          <table className="v5-table">
            <thead>
              <tr className="border-b border-[#eaeaea]">
                <th className="v5-th">Model</th>
                <th className="v5-th text-center">Prompt cost</th>
                <th className="v5-th text-center">Completion cost</th>
              </tr>
            </thead>
            <tbody>
              {modelPrices.map((item) => (
                <tr key={item.name} className="v5-tr text-slate-700">
                  <td className="v5-td font-bold text-slate-900">
                    <div>{item.name}</div>
                    <div className="text-[10px] text-[#666] font-normal mt-0.5">{item.creator}</div>
                  </td>
                  <td className="v5-td v5-td-mono text-center">{item.promptPrice}</td>
                  <td className="v5-td v5-td-mono text-center">{item.completionPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
