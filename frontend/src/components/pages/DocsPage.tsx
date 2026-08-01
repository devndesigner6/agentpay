import { useState } from 'react'
import { TextReveal } from '../ui/text-reveal.js'
import { SwipeDeck } from '../ui/swipe-deck.js'

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('python')

  const faqItems = [
    {
      id: 'q1',
      question: 'What is the x402 standard?',
      answer: 'An HTTP standard that lets clients pay for AI requests per call, using cryptographic transaction proofs as request signatures.'
    },
    {
      id: 'q2',
      question: 'Which currency is used for payment?',
      answer: 'Payments settle in USDC on the Algorand Testnet (and Mainnet-ready) for instant transaction finality.'
    },
    {
      id: 'q3',
      question: 'How does intelligent routing work?',
      answer: 'AgentPay monitors cost, latency, and reliability in real-time, automatically choosing the optimal backend model node.'
    },
    {
      id: 'q4',
      question: 'Is it free to start testing?',
      answer: 'Yes! Select the "Free Trial" tier to test with simulated sandbox payments and free routed models.'
    }
  ]

  const codeBlocks = {
    python: `import requests

# Set your request preference: "cheapest", "fastest", or "reliable"
payload = {
    "prompt": "Explain quantum computing in simple terms",
    "prefer": "cheapest"
}

# Settle the x402 payment proof header
headers = {
    "PAYMENT-SIGNATURE": "<x402_v2_payment_payload>"
}

response = requests.post(
    "https://YOUR_DOMAIN/api/generate",
    json=payload,
    headers=headers
)

print(response.json())
# Output:
# {
#   "result": "Quantum computing uses...",
#   "provider": "Llama 3.2 (3B)",
#   "price_paid": "$0.005",
#   "payment_tx": "AP_TX_XXXXXX"
# }`,
    javascript: `// Set request parameters
const payload = {
  prompt: "Explain quantum computing in simple terms",
  prefer: "cheapest"
};

// Settle payment proof header
const headers = {
  "Content-Type": "application/json",
  "PAYMENT-SIGNATURE": "<x402_v2_payment_payload>"
};

fetch("https://YOUR_DOMAIN/api/generate", {
  method: "POST",
  headers,
  body: JSON.stringify(payload)
})
.then(res => res.json())
.then(data => console.log(data));`,
    curl: `curl -X POST https://YOUR_DOMAIN/api/generate \\
  -H "Content-Type: application/json" \\
  -H "PAYMENT-SIGNATURE: <x402_v2_payment_payload>" \\
  -d '{
    "prompt": "Explain quantum computing in simple terms",
    "prefer": "cheapest"
  }'`
  }

  return (
      <div className="max-w-4xl mx-auto px-6 py-12 font-sans bg-[#fafafa] min-h-screen">
      
      {/* Header */}
      <div className="mb-10 select-none text-center">
        <h1 className="text-3xl font-extrabold text-[#111] mb-2 tracking-tight">
          <TextReveal text="API Documentation" className="font-bold text-[#111]" stagger={0.06} maxDuration={1.0} />
        </h1>
        <p className="text-xs text-[#666]">Integrate autonomous AI agents with AgentPay's x402 payment router.</p>
        <div className="mt-6 v5-card p-5 text-xs leading-relaxed text-slate-600">
          <h2 className="font-bold text-slate-900 mb-2">How x402 agent routing works</h2>
          <p>An agent calls AgentPay, receives HTTP 402, signs the requested Algorand USDC payment, and retries with the payment proof. AgentPay applies the selected policy, pays the chosen provider through x402, and returns the model response with settlement metadata.</p>
          <p className="mt-3">Agent keys identify and constrain callers; they never expose the router mnemonic or provider keys. Use the Console to create an agent, select its preference, and inspect its resulting paid runs.</p>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* Step 1 */}
        <section className="v5-card p-6 bg-white shadow-sm">
          <h2 className="text-sm font-bold text-[#111] mb-3">1. Overview of x402 routing</h2>
          <p className="text-xs text-[#666] leading-relaxed mb-4">
            AgentPay acts as a smart gateway routing AI prompts across multiple providers depending on pricing, speed, or availability. All payments are structured, authorized, and settled using the **x402 protocol** via the GoPlausible Facilitator on Algorand.
          </p>
          <div className="bg-[#fafafa] border border-[#eaeaea] rounded-lg p-4 font-mono text-[10px] text-slate-500 space-y-1.5 select-none">
            <div className="text-slate-800 font-bold">Micropayment Flow:</div>
            <div>Step A: Call POST /generate without headers. Receives HTTP 402 + Payment Requirements.</div>
            <div>Step B: Construct USDC transaction, sign via connected wallet.</div>
            <div>Step C: Resubmit the signed x402 v2 payload in the PAYMENT-SIGNATURE header.</div>
          </div>
        </section>

        {/* Step 2 */}
        <section className="v5-card p-6 bg-white shadow-sm">
          <h2 className="text-sm font-bold text-[#111] mb-3">2. API Integration</h2>
          <p className="text-xs text-[#666] leading-relaxed mb-6">
            Below are examples of how to query the routed generate endpoint from your agent environment using python, javascript, or curl commands:
          </p>

          <div className="border border-[#eaeaea] rounded-xl overflow-hidden shadow-sm">
            {/* Lang switcher */}
            <div className="flex bg-[#fafafa] border-b border-[#eaeaea] py-2.5 px-4 gap-2 select-none">
              <div className="v5-tabs-secondary">
                {['python', 'javascript', 'curl'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveTab(lang)}
                    className={`v5-tab-secondary ${activeTab === lang ? 'active' : ''}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Code editor */}
            <pre className="p-5 text-[#f5f5f5] bg-black overflow-x-auto leading-relaxed select-text select-all font-mono text-[11px]">
              {codeBlocks[activeTab as keyof typeof codeBlocks]}
            </pre>
          </div>
        </section>

        {/* Step 3: Swipe Q&A */}
        <section className="v5-card p-6 bg-white shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#111] mb-1">Quick-Start Interactive Q&A</h2>
          <p className="text-xs text-[#666] leading-relaxed mb-4">
            Swipe through the cards below to quickly grasp the core concepts of AgentPay FinOps.
          </p>
          <SwipeDeck
            items={faqItems}
            itemKey={(q) => q.id}
            itemLabel={(q) => q.question}
            leftLabel="Dismiss"
            rightLabel="Got it"
            undoLabel="Go Back"
            emptyLabel="All cards reviewed! Press Go Back to read them again."
            height={160}
          >
            {(q) => (
              <div className="flex h-full flex-col justify-between p-5 bg-white text-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wide font-departure">Question</span>
                  <p className="mt-1.5 text-xs font-bold font-sans text-slate-900 leading-normal">{q.question}</p>
                </div>
                <p className="text-[11px] text-slate-500 font-sans leading-relaxed">{q.answer}</p>
              </div>
            )}
          </SwipeDeck>
        </section>

      </div>
    </div>
  )
}
