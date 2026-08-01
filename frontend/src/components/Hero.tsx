import { useState } from 'react'
import axios from 'axios'
import { useStore } from '../hooks/useStore.js'
import { API_BASE_URL } from '../config.js'
import { createPeraPaymentHeaders, readPaymentRequiredResponse } from '../utils/x402.js'
import { NETWORK_LABEL } from '../config.js'
import { decodePaymentResponseHeader } from '@x402-avm/core/http'

export default function Hero() {
  const { connectedWallet, connectWallet, peraWallet, fetchStats, setPage } = useStore()
  
  const [prompt, setPrompt] = useState('Explain quantum computing in simple terms')
  const [prefer, setPrefer] = useState('cheapest')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  
  // Payment step states: 'idle' | 'required' | 'signing' | 'verifying' | 'completed' | 'error'
  const [paymentStep, setPaymentStep] = useState<string>('idle')
  const [paymentRequirements, setPaymentRequirements] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [showConnectModal, setShowConnectModal] = useState(false)
  
  // Active pill selection
  const [activePill, setActivePill] = useState('gateway')

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `[${time}] ${msg}`])
  }

  const handleRouteRequest = async (paymentHeaders?: Record<string, string>) => {
    setLoading(true)
    setResponse(null)

    if (!paymentHeaders) {
      setLogs([])
      addLog(`Initiating request (prefer: ${prefer})...`)
      addLog(`POST ${API_BASE_URL}/generate`)
    } else {
      addLog(`Resubmitting request with payment proof header...`)
    }

    try {
      const headers: Record<string, string> = {}
      Object.assign(headers, paymentHeaders)

      const res = await axios.post(
        `${API_BASE_URL}/generate`,
        {
          prompt,
          prefer,
        },
        { headers }
      )

      addLog(`✅ HTTP 200: Successfully routed to ${res.data.provider}!`)
      addLog(`Latency: ${res.data.latency_ms}ms | Cost: ${res.data.price_paid}`)
      
      const paymentResponse = res.headers['payment-response']
      const inboundTransaction = paymentResponse ? decodePaymentResponseHeader(paymentResponse).transaction : res.data.payment_tx
      const completedResponse = { ...res.data, payment_tx: inboundTransaction }
      addLog(`Inbound settlement: ${inboundTransaction.substring(0, 16)}...`)
      addLog(`Provider settlement: ${completedResponse.provider_payment_tx?.substring(0, 16) || 'pending'}...`)
      setResponse(completedResponse)
      setPaymentStep('completed')
      
      // Update stats dashboard
      fetchStats()
    } catch (error: any) {
      if (error.response && error.response.status === 402) {
        const payReq = readPaymentRequiredResponse(error.response.data, error.response.headers['payment-required'])
        const rejectionReason = typeof payReq.error === 'string' ? payReq.error : ''
        if (paymentHeaders && rejectionReason && rejectionReason !== 'Payment required') {
          addLog(`❌ Facilitator rejected the signed payment: ${rejectionReason}`)
          setPaymentStep('error')
          return
        }
        addLog(`⚠️ HTTP 402: Payment Required!`)
        addLog(`Price: ${String(payReq.price || 'unknown')} USDC | Payee: ${String(payReq.payTo || 'unknown').substring(0, 12)}...`)
        
        setPaymentRequirements(payReq)
        setPaymentStep('required')
      } else {
        const errMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Unknown error'
        addLog(`❌ Error: ${errMsg}`)
        setPaymentStep('error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApprovePayment = async () => {
    if (!connectedWallet) {
      setShowConnectModal(true)
      return
    }

    setPaymentStep('signing')
    addLog(`Invoking Pera Wallet...`)
    addLog(`Constructing x402 payment on Algorand ${NETWORK_LABEL}...`)

    try {
      addLog(`Requesting user signature for transaction...`)
      const paymentHeaders = await createPeraPaymentHeaders(paymentRequirements, connectedWallet.address, peraWallet)

      /* Legacy v1 header construction retained below for source history.
      const singleTxn = [
        {
          txn,
          signers: [connectedWallet.address],
        },
      ]

      const signedTxnBytes = await peraWallet.signTransaction([singleTxn])
      const txId = txn.txID()
      
      addLog(`✍️ Transaction signed successfully! TxID: ${txId}`)
      
      const binaryString = Array.from(signedTxnBytes[0])
        .map((byte) => String.fromCharCode(byte))
        .join('')
      const base64SignedTxn = btoa(binaryString)

      const paymentPayload = {
        scheme: 'exact',
        network: paymentRequirements.network,
        txn: base64SignedTxn,
        txId,
      }

      const base64Header = btoa(JSON.stringify(paymentPayload)) */
      addLog(`Broadcasting real transaction to facilitator GoPlausible...`)
      setPaymentStep('verifying')
      
      await handleRouteRequest(paymentHeaders)
    } catch (error: any) {
      console.error('Real signing error:', error)
      addLog(`❌ Signing failed: ${error.message || error}`)
      setPaymentStep('required')
    }
  }

  const handleWalletSelect = async (type: 'pera') => {
    setShowConnectModal(false)
    if (type === 'pera') {
      try {
        await connectWallet()
      } catch (e) {}
    }
  }

  return (
    <div className="theme-v5 bg-[#fafafa]">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 border-b border-[#eaeaea]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#0047ff] text-[10px] font-bold rounded-full uppercase tracking-wider mb-6 border border-blue-100 animate-pulse">
            <span>●</span> Introducing AgentPay
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#111] leading-[1.15] mb-6 tracking-tight font-sans">
            Run and monetize agents
            <br />
            with financial control.
          </h1>

          <p className="text-xs md:text-sm text-[#666] mb-8 font-sans leading-relaxed max-w-2xl mx-auto">
            One gateway for the full agent lifecycle. Route model calls, track agent runs, enforce policy guardrails, and turn agents, workflows, and APIs into paid endpoints with measurable spend, revenue, and margin.
          </p>

          <div className="flex items-center justify-center gap-3 mb-12">
            <button
              onClick={() => {
                setPage('console')
              }}
              className="v5-btn v5-btn-primary rounded-lg text-xs font-bold px-6 py-2.5 shadow-sm"
            >
              Get Started →
            </button>
            <a
              href="https://github.com/agentpay"
              target="_blank"
              rel="noreferrer"
              className="v5-btn v5-btn-default rounded-lg text-xs font-semibold px-6 py-2.5"
            >
              View on GitHub
            </a>
          </div>

          {/* Interactive tabs representing products */}
          <div className="v5-tabs-secondary mx-auto mb-10 select-none">
            {['gateway', 'routing', 'guardrails', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActivePill(tab)}
                className={`v5-tab-secondary capitalize ${activePill === tab ? 'active' : ''}`}
              >
                {tab === 'gateway' ? 'API Gateway' : tab === 'routing' ? 'Smart Routing' : tab === 'guardrails' ? 'Guardrails' : 'Settings'}
              </button>
            ))}
          </div>

          {/* Mockup Dashboard Visual */}
          <div className="bg-white border border-[#eaeaea] rounded-2xl p-4 shadow-xl max-w-4xl mx-auto overflow-hidden relative group">
            <div className="h-6 border-b border-[#eaeaea] flex items-center gap-1.5 px-2 mb-4 select-none">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <span className="text-[10px] text-slate-400 font-bold ml-2 font-mono">console.agentpay.app/finance</span>
            </div>
            
            <div className="bg-[#fafafa] rounded-xl p-6 border border-[#eaeaea] text-left">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Known Net Margin</h3>
                  <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">+0.00 USDC</div>
                </div>
                <div className="text-xs font-semibold text-[#0047ff] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                  Updated just now ↻
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 border border-[#eaeaea] rounded-lg">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Revenue</div>
                  <div className="text-sm font-bold text-slate-900 mt-1 font-mono">+0.00 USDC</div>
                </div>
                <div className="bg-white p-4 border border-[#eaeaea] rounded-lg">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">LLM Token Cost</div>
                  <div className="text-sm font-bold text-red-500 mt-1 font-mono">-0.00 USDC</div>
                </div>
                <div className="bg-white p-4 border border-[#eaeaea] rounded-lg">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Agent Outbound Spend</div>
                  <div className="text-sm font-bold text-slate-400 mt-1 font-mono">Not Implemented</div>
                </div>
                <div className="bg-white p-4 border border-[#eaeaea] rounded-lg">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Known Margin</div>
                  <div className="text-sm font-bold text-slate-900 mt-1 font-mono">+0.00 USDC</div>
                </div>
              </div>
            </div>
            
            <div className="absolute inset-0 bg-slate-950/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <div className="w-14 h-14 bg-white border border-[#eaeaea] rounded-full shadow-lg flex items-center justify-center text-slate-900 hover:scale-105 transition-transform">
                <svg className="w-6 h-6 fill-current ml-1" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gateway Lifecycle Section */}
      <section className="py-20 border-b border-[#eaeaea]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-extrabold text-[#111] tracking-tight">One gateway for the full agent lifecycle</h2>
            <p className="text-xs text-[#666] mt-2 max-w-lg mx-auto">Maintain complete budget tracking and telemetry without changing provider infrastructures.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="v5-card">
              <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-[#0047ff] mb-4">
                ϟ
              </div>
              <h3 className="font-bold text-[#111] text-xs uppercase tracking-wider mb-2">Model API Gateway</h3>
              <p className="text-xs text-[#666] leading-relaxed">
                Smart routing balance systems, automatic failover latency controls, routing distributions, and detailed request caches.
              </p>
            </div>
            <div className="v5-card">
              <div className="w-8 h-8 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                ◈
              </div>
              <h3 className="font-bold text-[#111] text-xs uppercase tracking-wider mb-2">Monetization Engine</h3>
              <p className="text-xs text-[#666] leading-relaxed">
                Turn your agents, custom workflows, or standard API paths into paid, billing-enabled endpoints using the x402 protocol.
              </p>
            </div>
            <div className="v5-card">
              <div className="w-8 h-8 bg-purple-50 border border-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                ◌
              </div>
              <h3 className="font-bold text-[#111] text-xs uppercase tracking-wider mb-2">Runtime Guardrails</h3>
              <p className="text-xs text-[#666] leading-relaxed">
                Set hard rules for cost limits per request, daily spending budget limits, and token usage restrictions per agent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* From Free to Paid Steps Section */}
      <section className="py-20 bg-white border-b border-[#eaeaea]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-extrabold text-[#111] tracking-tight">From free model call to paid agent endpoints</h2>
            <p className="text-xs text-[#666] mt-2">Deploying and billing agents in three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-slate-200 mb-4">01</span>
              <h4 className="font-bold text-xs uppercase text-[#111] mb-2 tracking-wide">Get Provider Key</h4>
              <p className="text-xs text-[#666] leading-relaxed">
                Register keys for OpenAI, Anthropic, Gemini, DeepSeek, or create a custom provider configuration endpoint.
              </p>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-slate-200 mb-4">02</span>
              <h4 className="font-bold text-xs uppercase text-[#111] mb-2 tracking-wide">Add Model Access</h4>
              <p className="text-xs text-[#666] leading-relaxed">
                Fund a unified prepaid credit balance or connect your own provider key for direct vendor billing.
              </p>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-slate-200 mb-4">03</span>
              <h4 className="font-bold text-xs uppercase text-[#111] mb-2 tracking-wide">Route through Gateway</h4>
              <p className="text-xs text-[#666] leading-relaxed">
                Use your master keys to issue virtual keys to agents, enforcing failovers, budgets, and monetization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Python Integration Section */}
      <section className="py-20 border-b border-[#eaeaea]">
        <div className="max-w-5xl mx-auto px-6 flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 text-left max-w-xl">
            <h2 className="text-2xl font-extrabold text-[#111] tracking-tight mb-4">Agents have no wallets.<br />That's the guarantee.</h2>
            <p className="text-xs text-[#666] leading-relaxed mb-6">
              Unlike other platforms that force developers to fund individual wallets for every agent, AgentPay routes model calls through a unified provider key with built-in per-run tracking, security permissions, and hard budget policies.
            </p>
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <span className="text-[#0047ff] font-bold">✓</span> No wallet private keys exposed to autonomous runtimes.
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#0047ff] font-bold">✓</span> Centralized budget control with real-time kill-switches.
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#0047ff] font-bold">✓</span> Fast setup: simply replace your OpenAI or custom endpoint base URL.
              </li>
            </ul>
          </div>

          <div className="flex-1 w-full max-w-xl font-mono text-[11px] bg-black border border-[#eaeaea] rounded-xl overflow-hidden shadow-xl">
            <div className="bg-[#fafafa] px-4 py-3 border-b border-[#eaeaea] flex items-center justify-between select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-slate-500 font-bold ml-2">integration.py</span>
              </div>
              <span className="v5-badge v5-badge-brand text-[9px] font-bold">1 line changed</span>
            </div>
            <pre className="p-5 text-[#f5f5f5] bg-black overflow-x-auto leading-relaxed select-text select-all font-mono">
{`from openai import OpenAI
import os

client = OpenAI(
    api_key=os.environ.get("AGENTPAY_API_KEY"),
    base_url="https://api.agentpay.app/v1" # Route model calls
)

response = client.chat.completions.create(
    model="google/gemma-4-31b",
    messages=[{"role": "user", "content": "hello"}]
)`}
            </pre>
          </div>
        </div>
      </section>

      {/* Live Workspace Interactive Section */}
      <section id="live-playground" className="py-20 bg-white border-b border-[#eaeaea]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-extrabold text-[#111] tracking-tight">Explore a live workspace. No signup needed.</h2>
            <p className="text-xs text-[#666] mt-2">Test out model smart routing and simulated x402 payments directly in the sandbox below.</p>
          </div>

          <div className="grid md:grid-cols-5 gap-6 text-left">
            {/* Input Interface */}
            <div className="md:col-span-3 v5-card flex flex-col justify-between shadow-sm relative bg-[#fafafa]">
              <div>
                <h3 className="font-bold text-[#111] text-xs mb-5 flex items-center gap-2 font-sans select-none">
                  <span className="w-2.5 h-2.5 bg-[#16a34a] rounded-full animate-pulse" />
                  Router Playground
                </h3>

                <div className="mb-4">
                  <label className="text-[10px] uppercase tracking-wider text-[#666] font-bold block mb-1.5 select-none font-sans">Prompt Input</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="v5-textarea w-full bg-white text-xs text-[#111] focus:outline-none"
                    rows={4}
                  />
                </div>

                <div className="mb-6">
                  <label className="text-[10px] uppercase tracking-wider text-[#666] font-bold block mb-1.5 select-none font-sans">Routing Policy Mode</label>
                  <select
                    value={prefer}
                    onChange={(e) => setPrefer(e.target.value)}
                    className="v5-select w-full bg-white text-xs text-[#111] focus:outline-none"
                  >
                    <option value="cheapest">Laguna XS 2.1 (free) - $0.005</option>
                    <option value="reliable">Most Reliable Route</option>
                    <option value="fastest">Nemotron 3 Ultra (free) - $0.020</option>
                  </select>
                </div>
              </div>

              <div>
                <button
                  disabled={loading || paymentStep === 'signing' || paymentStep === 'verifying'}
                  onClick={() => handleRouteRequest()}
                  className="v5-btn v5-btn-primary w-full py-3.5 text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 font-sans"
                >
                  {loading ? 'Routing Request...' : 'Route Prompt with x402 ($0.03 USDC)'}
                </button>
              </div>
            </div>

            {/* Logs Terminal Panel */}
            <div className="md:col-span-2 bg-black border border-slate-900 rounded-2xl p-6 flex flex-col justify-between min-h-[340px] font-mono text-[10px] text-slate-300 relative overflow-hidden shadow-xl">
              
              {/* x402 Payment Overlay */}
              {paymentStep === 'required' && (
                <div className="absolute inset-0 bg-slate-950/98 flex flex-col justify-center items-center p-6 text-center z-10">
                  <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-4 text-[#16a34a] text-xs font-bold animate-pulse font-mono">
                    402
                  </div>
                  <h4 className="font-bold text-white text-xs mb-1 font-sans">Payment Required</h4>
                  <p className="text-slate-400 mb-5 font-sans text-[11px] leading-relaxed">
                    This request requires a micropayment of {paymentRequirements?.price} USDC. Please sign using your connected wallet.
                  </p>
                  
                  {connectedWallet ? (
                    <button
                      onClick={handleApprovePayment}
                      className="v5-btn v5-btn-primary w-full py-2.5 text-xs font-bold"
                    >
                      Pay with Pera Wallet
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowConnectModal(true)}
                      className="v5-btn v5-btn-primary w-full py-2.5 text-xs font-bold"
                    >
                      Connect Wallet to Pay
                    </button>
                  )}
                  <button
                    onClick={() => setPaymentStep('idle')}
                    className="mt-3 text-slate-500 hover:text-slate-400 font-sans text-[11px]"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Logs console header */}
              <div className="border-b border-slate-900 pb-3 flex items-center justify-between select-none">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Transaction Console logs</span>
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                </div>
              </div>

              {/* Terminal Log Items */}
              <div className="flex-1 py-4 overflow-y-auto space-y-2 max-h-[220px] scrollbar-thin select-text">
                {logs.length === 0 ? (
                  <div className="text-slate-600 text-center select-none pt-12">Console idle. Submit a prompt to start.</div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="leading-relaxed whitespace-pre-wrap break-words">{log}</div>
                  ))
                )}
              </div>

              {/* Output result state */}
              <div className="border-t border-slate-900 pt-3 flex items-center justify-between select-none">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Verification Receipt</span>
                {response ? (
                  <span className="text-[#16a34a] text-[9px] font-bold">SUCCESS</span>
                ) : (
                  <span className="text-slate-600 text-[9px]">AWAITING DATA</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plan Section */}
      <section className="py-20 border-b border-[#eaeaea]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-extrabold text-[#111] tracking-tight">Pricing for production AI agents</h2>
            <p className="text-xs text-[#666] mt-2">Transparent billing, pay-as-you-go, or enterprise dedicated deployments.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            <div className="v5-card flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-[#111] text-sm mb-2">Free</h4>
                <p className="text-xs text-slate-500 mb-6">For hobbyists experimenting with agents.</p>
                <div className="text-3xl font-extrabold text-[#111] mb-6">$0 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                <ul className="space-y-3 text-xs text-slate-600 mb-8">
                  <li>• Smart Routing access (free models)</li>
                  <li>• 1 active provider key</li>
                  <li>• Up to 3 active virtual keys</li>
                  <li>• Standard failover latency</li>
                </ul>
              </div>
              <button onClick={() => setPage('console')} className="v5-btn v5-btn-default w-full py-2">Get Started</button>
            </div>
            
            <div className="v5-card border-slate-900 shadow-md relative flex flex-col justify-between">
              <span className="absolute top-0 right-6 -translate-y-1/2 bg-[#0047ff] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">POPULAR</span>
              <div>
                <h4 className="font-bold text-[#111] text-sm mb-2">Pro</h4>
                <p className="text-xs text-slate-500 mb-6">For teams deploying active commercial agents.</p>
                <div className="text-3xl font-extrabold text-[#111] mb-6">$29 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                <ul className="space-y-3 text-xs text-slate-600 mb-8">
                  <li>• Everything in Free</li>
                  <li>• Unlimited provider keys</li>
                  <li>• Unlimited virtual keys</li>
                  <li>• Advanced policy guardrails</li>
                  <li>• Real-time webhook logs</li>
                </ul>
              </div>
              <button onClick={() => setPage('console')} className="v5-btn v5-btn-primary w-full py-2">Upgrade Pro</button>
            </div>

            <div className="v5-card flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-[#111] text-sm mb-2">Enterprise</h4>
                <p className="text-xs text-slate-500 mb-6">For high-throughput organization infrastructure.</p>
                <div className="text-3xl font-extrabold text-[#111] mb-6">Custom</div>
                <ul className="space-y-3 text-xs text-slate-600 mb-8">
                  <li>• Everything in Pro</li>
                  <li>• Dedicated API gateway</li>
                  <li>• Custom compliance reporting</li>
                  <li>• 99.9% uptime SLA guarantee</li>
                  <li>• Dedicated support engineering</li>
                </ul>
              </div>
              <button onClick={() => alert('Contacting support team...')} className="v5-btn v5-btn-default w-full py-2">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 bg-white border-b border-[#eaeaea]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-extrabold text-[#111] tracking-tight">Frequently asked questions</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What is an AI Agent Finance Gateway?",
                a: "An AI Agent Finance Gateway acts as a secure, intermediate proxy layer between your agent applications and LLM providers. It monitors spending in real-time, intercepts calls based on budget logic, and supports micro-payments."
              },
              {
                q: "Do I need to fund multiple crypto wallets?",
                a: "No. With AgentPay, you configure your provider keys centrally. Agents use simple scoped virtual API keys that authorize spending without holding any wallet credentials or funds directly."
              },
              {
                q: "How does the x402 protocol work?",
                a: "x402 is an open standard that allows HTTP clients to settle micropayments on-chain instantly using standard payment headers, enabling instant monetization of AI agents and custom APIs."
              },
              {
                q: "Are my API keys stored securely?",
                a: "Yes. Your provider master keys are fully encrypted and never printed to the logs. They are only used by the gateway to sign model calls to the upstream providers."
              }
            ].map((faq, i) => (
              <details key={i} className="group border-b border-[#eaeaea] pb-4">
                <summary className="flex justify-between items-center font-bold text-xs uppercase tracking-wider text-[#111] cursor-pointer list-none select-none py-2 hover:text-[#0047ff] transition-colors">
                  {faq.q}
                  <span className="transition-transform group-open:rotate-180">↓</span>
                </summary>
                <p className="text-xs text-[#666] leading-relaxed mt-2.5 pl-1">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Stop Payments CTA section */}
      <section className="py-20 text-center bg-[#fafafa]">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-[#111] mb-4">Stop agent payments in an afternoon.</h2>
          <p className="text-xs text-[#666] mb-8 leading-relaxed">
            Register your first provider key, setup custom policy guardrails, and start routing agent traffic with full audit transparency.
          </p>
          <button
            onClick={() => setPage('console')}
            className="v5-btn v5-btn-primary rounded-lg text-xs font-bold px-8 py-3"
          >
            Get Started Live
          </button>
        </div>
      </section>

      {/* Wallet Connection Modal */}
      {showConnectModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={() => setShowConnectModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white border border-[#eaeaea] rounded-2xl shadow-xl z-50 p-6 font-sans">
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Connect Wallet</h3>
            <p className="text-slate-500 text-xs mb-5">Select an option to connect your wallet.</p>
            
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => handleWalletSelect('pera')}
                className="w-full py-3 px-4 bg-[#fafafa] border border-[#eaeaea] hover:bg-[#f5f5f5] text-[#111] text-xs font-semibold rounded-xl flex items-center justify-between transition-all"
              >
                <span>Pera Wallet (Algorand {NETWORK_LABEL})</span>
                <span className="v5-badge v5-badge-warning text-[9px] uppercase font-bold">Real</span>
              </button>
            </div>

            <button
              onClick={() => setShowConnectModal(false)}
              className="w-full mt-4 py-2 text-center text-slate-400 hover:text-slate-500 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  )
}
