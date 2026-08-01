import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useStore } from '../../hooks/useStore.js'
import { API_BASE_URL } from '../../config.js'
import { createPeraPaymentHeaders, readPaymentRequiredResponse } from '../../utils/x402.js'
import { NETWORK_LABEL } from '../../config.js'

export default function ChatPage() {
  const {
    connectedWallet,
    connectWallet,
    peraWallet,
    chatModel,
    setChatModel,
    chatMessages,
    addChatMessage,
    clearChat,
    fetchStats
  } = useStore()

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.')
  const [temperature, setTemperature] = useState(0.7)
  const [showConnectModal, setShowConnectModal] = useState(false)

  // Payment states
  const [paymentStep, setPaymentStep] = useState<'idle' | 'required' | 'signing' | 'verifying'>('idle')
  const [paymentRequirements, setPaymentRequirements] = useState<any>(null)
  const [pendingUserMessage, setPendingUserMessage] = useState<string>('')
  
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, loading, paymentStep])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userText = input
    setInput('')
    
    // Add user message to UI
    addChatMessage({
      id: Math.random().toString(),
      role: 'user',
      content: userText
    })

    setPendingUserMessage(userText)
    await submitRequest(userText)
  }

  const submitRequest = async (userText: string, paymentHeaders?: Record<string, string>) => {
    setLoading(true)
    setPaymentStep('idle')

    try {
      const headers: Record<string, string> = {}
      Object.assign(headers, paymentHeaders)

      const res = await axios.post(
        `${API_BASE_URL}/generate`,
        {
          prompt: userText,
          prefer: chatModel, // cheapest, balanced, fastest
        },
        { headers }
      )

      // Success! Add response to chat messages list
      addChatMessage({
        id: Math.random().toString(),
        role: 'assistant',
        content: res.data.result,
        provider: res.data.provider,
        latency: res.data.latency_ms,
        txHash: res.data.payment_tx
      })

      setPendingUserMessage('')
      fetchStats() // Reload metrics
    } catch (error: any) {
      if (error.response && error.response.status === 402) {
        const payReq = readPaymentRequiredResponse(error.response.data, error.response.headers['payment-required'])
        const rejectionReason = typeof payReq.error === 'string' ? payReq.error : ''
        if (paymentHeaders && rejectionReason && rejectionReason !== 'Payment required') {
          setPaymentStep('idle')
          addChatMessage({
            id: Math.random().toString(),
            role: 'assistant',
            content: `Payment rejected by the facilitator: ${rejectionReason}`,
          })
          return
        }
        setPaymentRequirements(payReq)
        setPaymentStep('required')
      } else {
        const errMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Routing error occurred'
        addChatMessage({
          id: Math.random().toString(),
          role: 'system',
          content: `❌ Error: ${errMsg}`
        })
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
    try {
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
      setPaymentStep('verifying')
      
      await submitRequest(pendingUserMessage, paymentHeaders)
    } catch (error: any) {
      console.error('Real signing error:', error)
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
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-6 font-sans bg-[#fafafa] min-h-[calc(100vh-4rem)] select-none">
      
      {/* Left Settings Sidebar */}
      <div className="w-full md:w-80 space-y-6 flex-shrink-0">
        <div className="v5-card p-5 bg-white shadow-sm">
          <h3 className="v5-card-title text-xs uppercase tracking-wider mb-4">Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="v5-label text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Active Model Preference</label>
              <select
                value={chatModel}
                onChange={(e) => setChatModel(e.target.value)}
                className="v5-select text-xs text-[#111]"
              >
                <option value="cheapest">Llama 3.2 (3B) - $0.005</option>
                <option value="reliable">Most reliable route</option>
                <option value="fastest">Gemini 2 Flash - $0.020</option>
              </select>
            </div>

            <div>
              <label className="v5-label text-[10px] uppercase font-bold text-slate-400 block mb-1.5">System Prompt</label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="v5-textarea text-xs text-[#111]"
                rows={3}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="v5-label text-[10px] uppercase font-bold text-slate-400">Temperature</label>
                <span className="text-[10px] text-slate-700 font-mono font-bold">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-blue-600 bg-slate-200 h-1.5 rounded"
              />
            </div>

            <button
              onClick={clearChat}
              className="v5-btn v5-btn-default w-full py-2 text-xs font-semibold rounded-lg"
            >
              Clear Chat History
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Playground Area */}
      <div className="flex-1 v5-card flex flex-col justify-between overflow-hidden shadow-sm bg-white min-h-[460px]">
        
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[380px] scrollbar-thin">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {msg.role !== 'user' && msg.role !== 'system' && (
                <span className="text-[10px] text-[#666] font-semibold mb-1 uppercase tracking-wider font-sans select-none">
                  {msg.provider ? `${msg.provider}` : 'Router System'}
                </span>
              )}

              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed break-words font-sans select-text ${
                  msg.role === 'user'
                    ? 'bg-[#0047ff] text-white font-semibold shadow-sm'
                    : msg.role === 'system'
                    ? 'v5-alert v5-alert-error w-full max-w-full text-center py-2'
                    : 'bg-[#f5f5f5] border border-[#eaeaea] text-[#111]'
                }`}
              >
                {msg.content}

                {/* Routed metadata block */}
                {msg.role === 'assistant' && msg.latency && (
                  <div className="mt-2.5 border-t border-[#eaeaea] pt-2 text-[9px] text-[#666] font-mono flex items-center justify-between select-none">
                    <span>Latency: {msg.latency}ms</span>
                    {msg.txHash && (
                      <span className="truncate max-w-[120px]">
                        Tx: {msg.txHash.substring(0, 12)}...
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Prompt Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium font-sans">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Routing request to best provider...</span>
            </div>
          )}

          {/* Payment Prompt in Feed */}
          {paymentStep === 'required' && (
            <div className="v5-card p-5 flex flex-col justify-center items-center text-center max-w-md mx-auto select-none mt-4">
              <div className="w-9 h-9 bg-slate-50 border border-[#eaeaea] rounded-full flex items-center justify-center mb-3 text-[#16a34a] text-xs font-bold animate-pulse font-mono">
                402
              </div>
              <h4 className="font-bold text-[#111] text-xs mb-1 font-sans">Payment Required</h4>
              <p className="text-[#666] font-sans text-[11px] mb-4 leading-normal">
                To route your prompt, please authorize the payment of {paymentRequirements?.price} USDC.
              </p>
              
              <div className="flex gap-2 w-full">
                {connectedWallet ? (
                  <button
                    onClick={handleApprovePayment}
                    className="v5-btn v5-btn-primary flex-1 py-2 text-xs font-bold"
                  >
                    Pay with Wallet
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConnectModal(true)}
                    className="v5-btn v5-btn-primary flex-1 py-2 text-xs font-bold"
                  >
                    Connect Wallet
                  </button>
                )}
                <button
                  onClick={() => setPaymentStep('idle')}
                  className="v5-btn v5-btn-default px-3 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Signing / Settlement Loading Feed */}
          {(paymentStep === 'signing' || paymentStep === 'verifying') && (
            <div className="v5-card p-5 flex flex-col justify-center items-center text-center max-w-md mx-auto select-none mt-4 font-sans">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <h5 className="font-bold text-[#111] text-xs mb-0.5">
                {paymentStep === 'signing' ? 'Invoking Wallet Singer...' : 'Settle transaction proof...'}
              </h5>
              <p className="text-[#666] text-[10px]">
                {paymentStep === 'signing'
                  ? 'Confirm the USDC payment request inside your browser extension/mobile app'
                  : 'Awaiting atomic confirmation checks on GoPlausible'}
              </p>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar Form */}
        <form onSubmit={handleSendMessage} className="border-t border-[#eaeaea] p-4 bg-[#fafafa] flex gap-3">
          <input
            type="text"
            placeholder="Type your prompt here... (Each request triggers a $0.03 USDC route)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || paymentStep !== 'idle'}
            className="v5-input flex-1 text-xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || paymentStep !== 'idle'}
            className="v5-btn v5-btn-primary px-5 py-2 text-xs font-bold"
          >
            Send
          </button>
        </form>

      </div>

      {/* Wallet Connection Modal */}
      {showConnectModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={() => setShowConnectModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white border border-[#eaeaea] rounded-2xl shadow-xl z-50 p-6 font-sans">
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Connect Wallet</h3>
            <p className="text-slate-500 text-xs mb-5">Select your preferred Algorand wallet connection option.</p>
            
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
