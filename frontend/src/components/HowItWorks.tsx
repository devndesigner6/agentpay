export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Connect',
      subtitle: 'Add provider keys or USDC balance, then route model calls through AgentPay without rewriting your agent code.',
      uiMockup: (
        <div className="mt-4 p-3 bg-[#fafafa] border border-[#eaeaea] rounded-lg select-none font-mono text-[9px] text-[#666] truncate">
          AGENTPAY_API_URL="https://your-api.example/api"
        </div>
      )
    },
    {
      number: '02',
      title: 'Create Agent',
      subtitle: 'Create an agent profile, issue a virtual key, and define the Algorand wallet that will fund the runs.',
      uiMockup: (
        <div className="mt-4 p-3 bg-[#fafafa] border border-[#eaeaea] rounded-lg select-none font-mono text-[9px] text-[#666] truncate">
          agent_id="agt_trading_bot_01"
        </div>
      )
    },
    {
      number: '03',
      title: 'Route Runs',
      subtitle: 'Attach each model call to an agent session and run so cost, latency, and ELO metrics can be traced.',
      uiMockup: (
        <div className="mt-4 p-3 bg-[#fafafa] border border-[#eaeaea] rounded-lg select-none font-mono text-[9px] text-[#666] truncate">
          AgentPay-Run-Id: run_9x12a8b3
        </div>
      )
    },
    {
      number: '04',
      title: 'Control',
      subtitle: 'Apply intelligent routing rules, budgets, and runtime policy guardrails before expensive calls complete.',
      uiMockup: (
        <div className="mt-4 p-3 bg-[#fafafa] border border-[#eaeaea] rounded-lg select-none font-mono text-[9px] text-[#666] truncate">
          policy = budget_cap + model_rules
        </div>
      )
    },
    {
      number: '05',
      title: 'Monetize',
      subtitle: 'Publish selected capabilities as paid endpoints and automatically verify payments per call via x402.',
      uiMockup: (
        <div className="mt-4 p-3 bg-[#fafafa] border border-[#eaeaea] rounded-lg select-none font-mono text-[9px] text-[#666] truncate">
          endpoint_price = "$0.03 / call"
        </div>
      )
    },
    {
      number: '06',
      title: 'Measure',
      subtitle: 'Track spend, revenue, latency trends, and net margins attributed per agent and settled on-chain.',
      uiMockup: (
        <div className="mt-4 p-3 bg-[#fafafa] border border-[#eaeaea] rounded-lg select-none font-mono text-[9px] text-[#666] truncate">
          margin = revenue - model_spend
        </div>
      )
    }
  ]

  return (
    <section className="py-20 bg-white border-t border-[#eaeaea] select-none font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="mb-16 text-left">
          <span className="text-[10px] uppercase tracking-wider text-blue-600 font-bold block mb-2">How It Works</span>
          <h2 className="text-3xl font-extrabold text-[#111] leading-tight mb-4 tracking-tight">
            From first model call to paid
            <br />
            agent endpoint.
          </h2>
          <p className="text-sm text-[#666] max-w-xl leading-relaxed">
            Start as an OpenAI-compatible gateway, then add agent identity, run tracking, policy control, and monetization when the workflow is ready.
          </p>
        </div>

        {/* 6 Step Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div 
              key={i} 
              className="v5-card p-6 flex flex-col justify-between hover:border-[#d9d9d9] transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="v5-badge v5-badge-info text-xs font-bold font-mono">
                    {step.number}
                  </span>
                  <svg className="w-3.5 h-3.5 text-[#a0a0a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-[#111] mb-2 font-sans">
                  {step.title}
                </h3>
                <p className="text-xs text-[#666] leading-relaxed font-sans">
                  {step.subtitle}
                </p>
              </div>

              {step.uiMockup}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
