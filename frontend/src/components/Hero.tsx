import { useState } from 'react'
import axios from 'axios'
import { useStore } from '../hooks/useStore.js'
import { API_BASE_URL } from '../config.js'
import { createPeraPaymentHeaders, readPaymentRequiredResponse } from '../utils/x402.js'
import { NETWORK_LABEL } from '../config.js'
import { decodePaymentResponseHeader } from '@x402-avm/core/http'

export default function Hero() {
  const { connectedWallet, connectWallet, peraWallet, fetchStats } = useStore()
  
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
    <section className="relative pt-20 pb-24 overflow-hidden grid-blueprint border-b border-[#eaeaea]">
      
      <div className="max-w-7xl mx-auto px-6 relative">
        
        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-12 items-center mb-16">
          
          {/* Left Text & CTAs */}
          <div className="flex-1 text-left max-w-2xl">
            {/* Alephant visual pills style */}
            <div className="v5-tabs-secondary mb-6 select-none">
              <button
                onClick={() => setActivePill('gateway')}
                className={`v5-tab-secondary ${activePill === 'gateway' ? 'active' : ''}`}
              >
                Agent Gateway
              </button>
              <button
                onClick={() => setActivePill('routing')}
                className={`v5-tab-secondary ${activePill === 'routing' ? 'active' : ''}`}
              >
                Smart Routing
              </button>
              <button
                onClick={() => setActivePill('guardrails')}
                className={`v5-tab-secondary ${activePill === 'guardrails' ? 'active' : ''}`}
              >
                Policy Guardrails
              </button>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-[#111] leading-[1.1] mb-6 tracking-tight font-sans">
              Run and route agents
              <br />
              with financial control.
            </h1>

            <p className="text-sm md:text-base text-[#666] mb-8 font-sans leading-relaxed">
              Open source agent finance gateway. Route model calls, track every agent run, enforce budgets and policies, and publish paid endpoints with spend, revenue, and margin visibility.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (!connectedWallet) {
                    setShowConnectModal(true)
                  } else {
                    document.getElementById('router-playground')?.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                className="v5-btn v5-btn-primary rounded-full text-xs font-bold transition-all shadow-sm"
              >
                Get Started →
              </button>
              <a
                href="#providers"
                className="v5-btn v5-btn-default rounded-full text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
              >
                Explore Models
              </a>
            </div>
          </div>

          {/* Right Python Editor Preview */}
          <div className="flex-1 w-full max-w-xl font-mono text-[11px] bg-black border border-[#eaeaea] rounded-xl overflow-hidden shadow-xl relative">
            <div className="bg-[#fafafa] px-4 py-3 border-b border-[#eaeaea] flex items-center justify-between select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-[10px] text-[#666] font-bold ml-2">integration.py</span>
              </div>
              <span className="v5-badge v5-badge-brand text-[9px] font-bold">1 line changed</span>
            </div>
            <pre className="p-5 text-[#f5f5f5] bg-black overflow-x-auto leading-relaxed select-text select-all font-mono">
{`from openai import OpenAI
import os

client = OpenAI(
    api_key=os.environ.get("AGENTPAY_API_KEY"),
    base_url="https://your-agentpay-api.example/api" # Route model calls
)

response = client.chat.completions.create(
    model="meta-llama/llama-3.2-3b-instruct",
    messages=[{"role": "user", "content": "Hello world"}]
)`}
            </pre>
          </div>

        </div>

        {/* Horizontal Divider Line */}
        <div className="border-t border-[#eaeaea] my-16" />

        {/* Live Router Playground Panel */}
        <div id="router-playground" className="max-w-5xl mx-auto text-left grid md:grid-cols-5 gap-6">
          
          {/* Input Interface */}
          <div className="md:col-span-3 v5-card p-6 flex flex-col justify-between shadow-sm relative">
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
                  <option value="cheapest">Llama 3.2 (3B) - $0.005</option>
                  <option value="reliable">Most Reliable Route</option>
                  <option value="fastest">Gemini 2 Flash - $0.020</option>
                  <option value="reliable">Most Reliable (High Success Rate)</option>
                </select>
              </div>
            </div>

            <div>
              <button
                disabled={loading || paymentStep === 'signing' || paymentStep === 'verifying'}
                onClick={() => handleRouteRequest()}
                className="v5-btn v5-btn-primary w-full py-3.5 text-xs font-bold rounded-xl shadow-sm disabled:opacity-50 font-sans"
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
    </section>
  )
}
