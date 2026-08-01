import { useState, useEffect } from 'react'
import { useStore } from '../../hooks/useStore.js'
import axios from 'axios'
import { API_BASE_URL } from '../../config.js'
import { ShimmerButton } from '../ui/shimmer-button.js'

interface AgentKey {
  id: string
  name: string
  key: string
  wallet: string
  created: string
  description?: string
  environment?: string
  type?: 'AI Agent' | 'Workflow Agent'
}

interface ProviderKey {
  id: string
  provider: string
  name: string
  baseUrl: string
  keyName: string
  apiKey: string
  status: 'Active' | 'Inactive'
  balance: number
}

interface TransactionRecord {
  id: string
  createdAt: string
  providerName?: string
  providerCost?: number
  downstreamPaymentTx?: string
  status: 'success' | 'failed'
}

export default function ConsolePage() {
  const { stats, fetchStats, connectedWallet, setPage } = useStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'gateway' | 'keys' | 'models' | 'policies' | 'logs' | 'account'>('overview')
  const [isGatewayDropdownOpen, setIsGatewayDropdownOpen] = useState(true)
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false)
  const [showNewMenu, setShowNewMenu] = useState(false)

  // Local state for generated virtual agent keys
  const [keysList, setKeysList] = useState<AgentKey[]>([
    {
      id: 'default-agent-1',
      name: 'Support Bot',
      key: 'ap_live_4f4e2c185b2a4d0e9c6f2a7b',
      wallet: connectedWallet?.address || '25-word wallet account address',
      created: new Date().toISOString().split('T')[0],
      description: 'Handles customer support questions and routes escalations.',
      environment: 'Production',
      type: 'AI Agent'
    }
  ])

  // Local state for registered Provider master keys
  const [providerKeys, setProviderKeys] = useState<ProviderKey[]>([
    {
      id: 'gemma-key',
      provider: 'Google',
      name: 'Gemma 4 31B Key',
      baseUrl: 'https://api.agentpay.app/v1',
      keyName: 'Gemma Key',
      apiKey: 'sk-...e0c2f2',
      status: 'Active',
      balance: 0.00
    }
  ])

  // Modals Visibility
  const [showAddModelAccess, setShowAddModelAccess] = useState(false)
  const [showSelectProvider, setShowSelectProvider] = useState(false)
  const [showConfigureKey, setShowConfigureKey] = useState(false)
  const [showCreateAgent, setShowCreateAgent] = useState(false)

  // Add Provider Key Form State
  const [selectedProvider, setSelectedProvider] = useState('OpenAI')
  const [providerName, setProviderName] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [keyName, setKeyName] = useState('')
  const [customApiKey, setCustomApiKey] = useState('')

  // Create Agent Form State
  const [agentType, setAgentType] = useState<'AI Agent' | 'Workflow Agent'>('AI Agent')
  const [agentName, setAgentName] = useState('')
  const [agentId, setAgentId] = useState('')
  const [agentDescription, setAgentDescription] = useState('')
  const [agentEnvironment, setAgentEnvironment] = useState('Production')

  // Guardrail Policy settings
  const [maxPriceLimit, setMaxPriceLimit] = useState(0.015)
  const [dailyBudgetLimit, setDailyBudgetLimit] = useState(5.00)
  const [failoverLatency, setFailoverLatency] = useState(250)

  const [runLogs, setRunLogs] = useState<TransactionRecord[]>([])

  useEffect(() => {
    fetchStats()
    axios.get<{ transactions: TransactionRecord[] }>(`${API_BASE_URL}/transactions`)
      .then(response => setRunLogs(response.data.transactions))
      .catch(error => console.error('Failed to fetch transaction history:', error))
  }, [])

  // Action: Add Provider Key (Form Submit)
  const handleAddProviderKey = (e: React.FormEvent) => {
    e.preventDefault()
    const newProviderKey: ProviderKey = {
      id: Date.now().toString(),
      provider: selectedProvider,
      name: providerName || `${selectedProvider} Master Key`,
      baseUrl: baseUrl || 'https://api.agentpay.app/v1',
      keyName: keyName || 'My Key',
      apiKey: customApiKey ? `sk-...${customApiKey.slice(-6)}` : 'sk-...default',
      status: 'Active',
      balance: 0.00
    }
    setProviderKeys((prev) => [...prev, newProviderKey])
    
    // Close configure key modal
    setShowConfigureKey(false)
    // Clear states
    setProviderName('')
    setBaseUrl('')
    setKeyName('')
    setCustomApiKey('')
  }

  // Action: Open select provider modal
  const openSelectProviderModal = () => {
    setShowAddModelAccess(false)
    setShowSelectProvider(true)
  }

  // Action: Open configure key modal
  const openConfigureKeyModal = () => {
    setShowSelectProvider(false)
    setShowConfigureKey(true)
  }

  // Action: Open create agent modal
  const openCreateAgentModal = () => {
    // Generate a default GUID for the agent ID
    const randomUuid = Array.from({ length: 5 }, () => 
      Math.floor(Math.random() * 65536).toString(16).padStart(4, '0')
    ).join('-')
    setAgentId(`${randomUuid}`)
    setShowCreateAgent(true)
  }

  // Action: Create Agent (Form Submit)
  const handleCreateAgentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agentName) return

    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    const newAgent: AgentKey = {
      id: agentId || Date.now().toString(),
      name: agentName,
      key: `ap_live_${randomHex}`,
      wallet: connectedWallet?.address || '25-word wallet account address',
      created: new Date().toISOString().split('T')[0],
      description: agentDescription,
      environment: agentEnvironment,
      type: agentType
    }

    setKeysList((prev) => [...prev, newAgent])
    setShowCreateAgent(false)

    // Clear form states
    setAgentName('')
    setAgentDescription('')
    setAgentEnvironment('Production')
    setAgentType('AI Agent')
  }

  const handleDeleteKey = (id: string) => {
    setKeysList((prev) => prev.filter((k) => k.id !== id))
  }

  const providersList = [
    { name: 'OpenAI', icon: '🟢' },
    { name: 'Anthropic', icon: '🟠' },
    { name: 'Gemini', icon: '✨' },
    { name: 'Meta Llama', icon: '🦙' },
    { name: 'OpenRouter', icon: '🚀' },
    { name: 'DeepSeek', icon: '🐳' },
    { name: 'Alibaba / Qwen', icon: '🌌' },
    { name: 'Kimi', icon: '🧪' },
    { name: 'vLLM', icon: '⚙️' }
  ]

  return (
    <div className="agentpay-workspace select-none">
      
      {/* Sidebar Layout */}
      <aside className="agentpay-sidebar">
        <button onClick={() => setPage('home')} className="agentpay-wordmark">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-lg font-bold">
              A
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-sm tracking-tight text-slate-900">AgentPay</span>
              <span className="text-[10px] text-slate-400 font-normal mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Personal
              </span>
            </div>
          </div>
        </button>

        <div className="agentpay-search">⌕ <span>Search...</span><kbd>Ctrl K</kbd></div>
        
        {/* Progress indicator */}
        <div className="px-2.5 mb-4">
          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 mb-1">
            <span>Quick Start</span>
            <span>1 / 6</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#0047ff] h-full rounded-full" style={{ width: '16.66%' }} />
          </div>
        </div>

        <div className="agentpay-nav-label">WORKSPACE</div>
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`agentpay-nav ${activeTab === 'overview' ? 'active' : ''}`}
        >
          <span className="flex items-center gap-2">▦ Finance</span>
        </button>

        {/* Agent Gateway nested tab list */}
        <div>
          <button 
            onClick={() => {
              setIsGatewayDropdownOpen(!isGatewayDropdownOpen)
              setActiveTab('gateway')
            }} 
            className={`agentpay-nav ${activeTab === 'gateway' ? 'active' : ''}`}
          >
            <span className="flex items-center gap-2">◉ Agent Gateway</span>
            <span className="text-[8px] text-slate-400">{isGatewayDropdownOpen ? '▼' : '▶'}</span>
          </button>
          
          {isGatewayDropdownOpen && (
            <div className="pl-4 mt-1 border-l border-slate-100 ml-3 space-y-0.5 animate-fade-in">
              {['Overview', 'Today', 'Sessions', 'Agent Runs', 'Requests', 'Cache', 'Prompts', 'Insights'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveTab('gateway')}
                  className="w-full text-left py-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-900 rounded px-2 block transition-colors"
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={() => setActiveTab('keys')} 
          className={`agentpay-nav ${activeTab === 'keys' ? 'active' : ''}`}
        >
          <span className="flex items-center gap-2">⚡ Agents</span>
        </button>

        <button 
          onClick={() => setActiveTab('models')} 
          className={`agentpay-nav ${activeTab === 'models' ? 'active' : ''}`}
        >
          <span className="flex items-center gap-2">◇ Models</span>
        </button>

        <div className="agentpay-nav-label mt-4">OPERATIONS</div>
        <button 
          onClick={() => setActiveTab('logs')} 
          className={`agentpay-nav ${activeTab === 'logs' ? 'active' : ''}`}
        >
          <span className="flex items-center gap-2">💳 Payments</span>
        </button>

        <button 
          onClick={() => setActiveTab('policies')} 
          className={`agentpay-nav ${activeTab === 'policies' ? 'active' : ''}`}
        >
          <span className="flex items-center gap-2">⚙️ Control</span>
        </button>

        <button 
          onClick={() => setActiveTab('account')} 
          className={`agentpay-nav ${activeTab === 'account' ? 'active' : ''}`}
        >
          <span className="flex items-center gap-2">👤 Account</span>
        </button>

        {/* Sidebar Footer */}
        <div className="agentpay-sidebar-foot">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <span>Credits</span>
            <span className="v5-badge v5-badge-neutral text-[8px]">Coming Soon</span>
          </div>
          
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center justify-between text-[11px] mb-3">
            <div>
              <div className="font-semibold text-slate-700">Pro</div>
              <div className="text-slate-400 mt-0.5">0 / 10</div>
            </div>
            <button onClick={() => alert('Upgrading subscription plan...')} className="text-[#0047ff] font-bold hover:underline">
              Add Payment - $29/mo
            </button>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-900 truncate max-w-[120px]">Hemanth Peddada</span>
            <button className="text-slate-400 hover:text-slate-900" aria-label="Notifications">🔔</button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <section className="agentpay-workspace-main">
        {/* Main Dashboard Bar */}
        <div className="agentpay-workspace-bar">
          <div className="relative">
            <button 
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all text-xs"
            >
              <span>▦ Pro Workspace</span>
              <span className="text-[8px] text-slate-400">▼</span>
            </button>
            {showWorkspaceMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowWorkspaceMenu(false)} />
                <div className="absolute left-0 mt-1.5 w-48 bg-white border border-[#eaeaea] rounded-xl shadow-lg p-1.5 z-50 animate-fade-in font-sans">
                  <button className="w-full text-left v5-popover-item" onClick={() => setShowWorkspaceMenu(false)}>Pro Workspace</button>
                  <button className="w-full text-left v5-popover-item" onClick={() => { alert('Switching workspace...'); setShowWorkspaceMenu(false); }}>+ Create Workspace</button>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 relative">
            <span className="text-slate-400">Updated just now ↻</span>
            <ShimmerButton 
              onClick={() => setShowNewMenu(!showNewMenu)}
              shimmerColor="#0047ff"
              background="#000000"
              className="rounded-lg text-xs py-1.5 px-3.5 flex items-center gap-1.5"
            >
              <span>＋ New</span>
              <span className="text-[8px] text-white">▼</span>
            </ShimmerButton>
            {showNewMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNewMenu(false)} />
                <div className="absolute right-0 mt-8 w-48 bg-white border border-[#eaeaea] rounded-xl shadow-lg p-1.5 z-50 animate-fade-in font-sans">
                  <button className="w-full text-left v5-popover-item" onClick={() => { openCreateAgentModal(); setShowNewMenu(false); }}>🤖 New Agent</button>
                  <button className="w-full text-left v5-popover-item" onClick={() => { setShowAddModelAccess(true); setShowNewMenu(false); }}>🔑 Add Provider Key</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Header content depends on tab */}
        <header className="agentpay-page-title">
          <div>
            <p className="text-[10px] font-bold text-[#0047ff] tracking-wider uppercase">
              {activeTab === 'overview' ? 'FINANCE OVERVIEW' : activeTab === 'keys' ? 'AGENT KEYS' : activeTab === 'policies' ? 'GUARDRAILS' : 'WORKSPACE ROUTER'}
            </p>
            <h1 className="text-2xl font-bold text-[#111] mt-1">
              {activeTab === 'overview' ? 'Finance' : activeTab === 'keys' ? 'Agents' : activeTab === 'policies' ? 'Control' : activeTab === 'account' ? 'API Keys' : 'Payments'}
            </h1>
            <span className="text-xs text-slate-500 mt-1 block font-sans">
              {activeTab === 'overview' ? 'Your AI consumption, paid endpoint revenue, and known margin at a glance.' : 'Configure dynamic routing and payment guardrails for agent key execution.'}
            </span>
          </div>
          {activeTab === 'overview' && (
            <div className="agentpay-range">
              <button className="active">24h</button>
              <button>30d</button>
            </div>
          )}
        </header>

        {/* Main Tabs Content */}
        
        {/* FINANCE OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in px-8 max-w-5xl w-full mx-auto pb-12">
            {/* Getting Started Box */}
            <div className="agentpay-setup-card bg-white border border-[#eaeaea] rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Getting Started</span>
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span>ⓘ</span> Provider Key
                </h4>
                <p className="text-xs text-slate-500">
                  Connect a provider key to start deploying agents. Earn per call via x402 — learn more →
                </p>
              </div>
              <ShimmerButton 
                onClick={() => setShowAddModelAccess(true)}
                shimmerColor="#0047ff"
                background="#000000"
                className="rounded-lg text-xs font-bold px-4 py-2"
              >
                Add Provider Key
              </ShimmerButton>
            </div>

            {/* Net Margin Card */}
            <div className="v5-card">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Known Net Margin · 24H ⓘ</h4>
                  <div className="text-3xl font-extrabold font-mono text-emerald-600 mt-1">+0.00 USDC</div>
                </div>
                {/* SVG green sparkline graph for premium visual */}
                <div className="w-24 h-12">
                  <svg viewBox="0 0 100 40" className="w-full h-full stroke-emerald-500 fill-none stroke-2">
                    <path d="M0,35 Q15,32 30,20 T60,25 T90,5 L100,2" />
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 pt-4 mt-2">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Revenue</div>
                  <div className="text-xs font-bold text-slate-700 font-mono mt-0.5">+0.00</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">LLM Token Cost</div>
                  <div className="text-xs font-bold text-red-500 font-mono mt-0.5">-0.00</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Outbound Agent Spend</div>
                  <div className="text-xs font-bold text-slate-400 font-mono mt-0.5">-0.00 <small className="text-[8px] block text-slate-300 uppercase">Not implemented</small></div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Known Margin</div>
                  <div className="text-xs font-bold text-slate-700 font-mono mt-0.5">+0.00</div>
                </div>
              </div>
            </div>

            {/* Split Metrics Grids */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Agent Monetization */}
              <div className="v5-card">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agent Monetization · 24H</h4>
                  <span className="text-xs text-slate-400 cursor-pointer hover:text-slate-900">→</span>
                </div>
                <div className="text-slate-400 text-xs font-semibold">Agent endpoint revenue</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">0.00 <span className="text-xs font-normal text-slate-400 font-sans">USDC</span></div>
                <div className="grid grid-cols-3 gap-2 mt-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-50 pt-3">
                  <div>NET <span className="text-slate-700 font-mono block mt-0.5">—</span></div>
                  <div>SETTLEMENTS <span className="text-slate-700 font-mono block mt-0.5">0</span></div>
                  <div>ENDPOINTS <span className="text-slate-700 font-mono block mt-0.5">0</span></div>
                </div>
              </div>

              {/* HTTP API Monetization */}
              <div className="v5-card">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HTTP API Monetization · 24H</h4>
                  <span className="text-xs text-slate-400 cursor-pointer hover:text-slate-900">→</span>
                </div>
                <div className="text-slate-400 text-xs font-semibold">Wrapped API endpoint revenue</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">0.00 <span className="text-xs font-normal text-slate-400 font-sans">USDC</span></div>
                <div className="grid grid-cols-3 gap-2 mt-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-50 pt-3">
                  <div>NET <span className="text-slate-700 font-mono block mt-0.5">—</span></div>
                  <div>SETTLEMENTS <span className="text-slate-700 font-mono block mt-0.5">0</span></div>
                  <div>API ENDPOINTS <span className="text-slate-700 font-mono block mt-0.5">0</span></div>
                </div>
              </div>

              {/* Agent Gateway */}
              <div className="v5-card">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agent Gateway · 24H</h4>
                  <span className="text-xs text-slate-400 cursor-pointer hover:text-slate-900">→</span>
                </div>
                <div className="text-slate-400 text-xs font-semibold">LLM Token Cost</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">0.00 <span className="text-xs font-normal text-slate-400 font-sans">USDC</span></div>
                <div className="grid grid-cols-3 gap-2 mt-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-50 pt-3">
                  <div>NET <span className="text-slate-700 font-mono block mt-0.5">—</span></div>
                  <div>SETTLEMENTS <span className="text-slate-700 font-mono block mt-0.5">0</span></div>
                  <div>ENDPOINTS <span className="text-slate-700 font-mono block mt-0.5">0</span></div>
                </div>
              </div>

              {/* Agent Spend */}
              <div className="v5-card">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agent Spend · 24H</h4>
                  <span className="text-xs text-slate-400 cursor-pointer hover:text-slate-900">→</span>
                </div>
                <div className="text-slate-400 text-xs font-semibold">Paid Calls (x402 outbound)</div>
                <div className="text-lg font-bold text-slate-400 mt-1">NOT IMPLEMENTED</div>
                <div className="grid grid-cols-3 gap-2 mt-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-50 pt-3">
                  <div>NET <span className="text-slate-700 font-mono block mt-0.5">—</span></div>
                  <div>SETTLEMENTS <span className="text-slate-700 font-mono block mt-0.5">0</span></div>
                  <div>ENDPOINTS <span className="text-slate-700 font-mono block mt-0.5">0</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT / API KEYS TAB */}
        {activeTab === 'account' && (
          <div className="space-y-6 animate-fade-in px-8 max-w-5xl w-full mx-auto mb-12">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Provider Master Keys</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage your provider keys and settings</p>
              </div>
              <ShimmerButton 
                onClick={() => setShowAddModelAccess(true)}
                shimmerColor="#0047ff"
                background="#000000"
                className="rounded-lg text-xs font-bold px-4 py-2"
              >
                ＋ New Key
              </ShimmerButton>
            </div>

            {/* Base URL details */}
            <div className="v5-card p-5 bg-white border border-[#eaeaea]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">AGENTPAY BASE URL</div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value="https://api.agentpay.app/v1" 
                  className="v5-input bg-slate-50 font-mono text-xs border border-slate-200" 
                />
                <button 
                  onClick={() => alert('API URL copied to clipboard.')}
                  className="v5-btn v5-btn-default rounded-lg text-xs"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* How model access works */}
            <div className="v5-card p-5 bg-white border border-[#eaeaea]">
              <h4 className="font-bold text-[#111] text-xs mb-1.5">How model access works</h4>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Use AgentPay Credits or BYO provider keys for model access. AgentPay issues scoped Virtual Keys to agents and members, then tracks runs, spend, and policy decisions.
              </p>

              {/* BADGES PATH FLOW */}
              <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
                <span className="v5-badge v5-badge-neutral text-[10px] px-3 py-1.5 font-semibold">Model Access</span>
                <span className="text-slate-300">→</span>
                <span className="v5-badge border border-blue-200 bg-blue-50 text-[#0047ff] text-[10px] px-3 py-1.5 font-bold flex items-center gap-1.5">
                  AgentPay Credits <small className="text-[8px] font-extrabold bg-[#0047ff] text-white px-1 py-0.2 rounded ml-1">REC</small>
                </span>
                <span className="text-slate-300">→</span>
                <span className="v5-badge v5-badge-neutral text-[10px] px-3 py-1.5 font-semibold">BYO Provider Key</span>
                <span className="text-slate-300">→</span>
                <span className="v5-badge v5-badge-neutral text-[10px] px-3 py-1.5 font-semibold">Virtual Keys</span>
                <span className="text-slate-300">→</span>
                <span className="v5-badge v5-badge-neutral text-[10px] px-3 py-1.5 font-semibold">Agents / Members</span>
                <span className="text-slate-300">→</span>
                <span className="v5-badge v5-badge-neutral text-[10px] px-3 py-1.5 font-semibold">Runs + Policy</span>
              </div>
              <p className="text-[11px] text-slate-400 italic font-medium">
                Credits are recommended for Smart Routing. BYO-Key is best for existing provider contracts or private model access.
              </p>
            </div>

            {/* Registered provider keys list */}
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Registered Provider Keys</h4>
              
              {providerKeys.map((pKey) => (
                <div key={pKey.id} className="v5-card border border-[#eaeaea] bg-white p-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#111]">{pKey.name}</h4>
                        <span className="v5-badge v5-badge-neutral text-[8px] font-bold uppercase">CUSTOM</span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono mt-1 block">{pKey.apiKey} · no virtual keys · ${pKey.balance.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" /> • Active
                      </span>
                      <button 
                        onClick={() => setProviderKeys((prev) => prev.filter((p) => p.id !== pKey.id))}
                        className="text-slate-300 hover:text-red-500 font-bold text-sm"
                        title="Delete Provider Key"
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-3">VIRTUAL KEYS: 0</div>
                  <div className="bg-[#fafafa] rounded-xl p-6 border border-dashed border-[#eaeaea] text-center flex flex-col items-center justify-center">
                    <span className="text-2xl mb-2 text-slate-300">🔑</span>
                    <span className="text-xs text-slate-400 block mb-3 font-semibold">No virtual keys yet. Virtual keys are issued automatically when you create an agent.</span>
                    <button 
                      onClick={openCreateAgentModal}
                      className="text-xs text-[#0047ff] font-bold hover:underline"
                    >
                      Create your first agent →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AGENTS / VIRTUAL KEYS LIST TAB */}
        {activeTab === 'keys' && (
          <div className="space-y-6 animate-fade-in px-8 max-w-5xl w-full mx-auto mb-12">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="v5-card-title text-xs uppercase tracking-wider">Active Virtual Agent Keys</h4>
              </div>
              <span className="v5-badge v5-badge-neutral text-[10px]">{keysList.length} Total</span>
            </div>

            {/* Keys List Table */}
            <div className="v5-table-wrapper">
              <div className="overflow-x-auto">
                <table className="v5-table">
                  <thead>
                    <tr className="border-b border-[#eaeaea]">
                      <th className="v5-th pb-3">Agent</th>
                      <th className="v5-th pb-3">Environment</th>
                      <th className="v5-th pb-3">API Key</th>
                      <th className="v5-th pb-3">Payer Wallet</th>
                      <th className="v5-th pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keysList.map((k) => (
                      <tr key={k.id} className="v5-tr text-slate-700">
                        <td className="v5-td">
                          <div className="font-semibold text-slate-900">{k.name}</div>
                          {k.description && <div className="text-[10px] text-slate-400 font-normal mt-0.5">{k.description}</div>}
                        </td>
                        <td className="v5-td">
                          <span className={`v5-badge ${k.environment === 'Production' ? 'v5-badge-brand' : 'v5-badge-neutral'}`}>
                            {k.environment || 'Production'}
                          </span>
                        </td>
                        <td className="v5-td v5-td-mono text-blue-600 truncate max-w-[120px]">{k.key}</td>
                        <td className="v5-td v5-td-mono text-slate-500 truncate max-w-[120px]">{k.wallet}</td>
                        <td className="v5-td text-right">
                          <button
                            onClick={() => handleDeleteKey(k.id)}
                            className="v5-btn v5-btn-danger v5-btn-sm"
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                    {keysList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="v5-td text-center text-slate-400 py-8 italic">
                          No active virtual agent keys configured yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CONTROL TAB */}
        {activeTab === 'policies' && (
          <div className="max-w-2xl px-8 w-full mx-auto space-y-6 mb-12">
            <div className="v5-card p-6 shadow-sm">
              <h4 className="v5-card-title text-xs uppercase tracking-wider mb-6">Runtime Guardrails</h4>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="v5-label text-[10px] uppercase font-bold text-slate-400">Max Cost Per Request Limit</label>
                    <span className="text-xs font-bold text-slate-900 font-mono">${maxPriceLimit.toFixed(3)} USDC</span>
                  </div>
                  <input
                    type="range"
                    min="0.005"
                    max="0.03"
                    step="0.005"
                    value={maxPriceLimit}
                    onChange={(e) => setMaxPriceLimit(parseFloat(e.target.value))}
                    className="w-full accent-[#0047ff] bg-slate-200 h-1.5 rounded"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="v5-label text-[10px] uppercase font-bold text-slate-400">Daily Agent Budget limit</label>
                    <span className="text-xs font-bold text-slate-900 font-mono">${dailyBudgetLimit.toFixed(2)} USDC</span>
                  </div>
                  <input
                    type="range"
                    min="1.00"
                    max="20.00"
                    step="1.00"
                    value={dailyBudgetLimit}
                    onChange={(e) => setDailyBudgetLimit(parseFloat(e.target.value))}
                    className="w-full accent-[#0047ff] bg-slate-200 h-1.5 rounded"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="v5-label text-[10px] uppercase font-bold text-slate-400">Model Failover latency Limit</label>
                    <span className="text-xs font-bold text-slate-900 font-mono">{failoverLatency} ms</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="500"
                    step="50"
                    value={failoverLatency}
                    onChange={(e) => setFailoverLatency(parseInt(e.target.value))}
                    className="w-full accent-[#0047ff] bg-slate-200 h-1.5 rounded"
                  />
                </div>

                <button
                  onClick={() => alert('Policies successfully saved to database.')}
                  className="v5-btn v5-btn-primary rounded-lg text-xs font-bold"
                >
                  Save Policies
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENTS / LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="v5-table-wrapper animate-fade-in font-mono text-[10px] max-w-5xl w-full mx-auto px-0 mb-12">
            <div className="bg-white px-5 py-4 border-b border-[#eaeaea] flex items-center justify-between">
              <h4 className="v5-card-title text-xs font-bold font-sans uppercase tracking-wider">Recent Agent Run Logs</h4>
              <span className="v5-badge v5-badge-success text-[10px] uppercase font-bold font-sans">Live telemetry</span>
            </div>
            <div className="overflow-x-auto">
              <table className="v5-table">
                <thead>
                  <tr className="border-b border-[#eaeaea]">
                    <th className="v5-th pb-3">Timestamp</th>
                    <th className="v5-th pb-3 font-sans">Agent Key</th>
                    <th className="v5-th pb-3 font-sans">Routed Model</th>
                    <th className="v5-th pb-3 font-sans">USDC Cost</th>
                    <th className="v5-th pb-3 font-sans">AVM Tx Hash</th>
                    <th className="v5-th pb-3 text-right font-sans">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">
                  {runLogs.map((log) => (
                    <tr key={log.id} className="v5-tr text-slate-700">
                      <td className="v5-td text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</td>
                      <td className="v5-td text-blue-600 font-semibold">Router wallet</td>
                      <td className="v5-td font-sans font-bold text-slate-900">{log.providerName || 'Unknown provider'}</td>
                      <td className="v5-td v5-td-mono font-bold text-emerald-600">${(log.providerCost || 0).toFixed(3)}</td>
                      <td className="v5-td v5-td-mono text-slate-500">{log.downstreamPaymentTx?.slice(0, 18) || 'Pending'}...</td>
                      <td className="v5-td text-right">
                        <span className="v5-badge v5-badge-success text-[9px] uppercase font-bold font-sans">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {runLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="v5-td text-center text-slate-400 py-8 font-sans italic">
                        No settled routing records yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODELS TAB */}
        {activeTab === 'models' && (
          <div className="agentpay-console-grid animate-fade-in mb-12">
            {stats?.provider_stats.map(p => (
              <div key={p.id} className="v5-card p-6">
                <span className="v5-badge v5-badge-brand">LIVE ROUTE</span>
                <h3 className="text-base font-bold mt-4">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-2">OpenRouter model available through AgentPay’s x402 provider network.</p>
                <div className="mt-5 text-xs font-mono">{p.requests} requests · {p.avg_latency}ms</div>
              </div>
            ))}
            {(!stats || stats.provider_stats.length === 0) && (
              ['Laguna XS 2.1 (free)', 'Gemma 4 31B (free)', 'Nemotron 3 Ultra (free)'].map((pName, index) => (
                <div key={index} className="v5-card p-6">
                  <span className="v5-badge v5-badge-brand">LIVE ROUTE</span>
                  <h3 className="text-base font-bold mt-4">{pName}</h3>
                  <p className="text-xs text-slate-500 mt-2">OpenRouter model available through AgentPay’s x402 provider network.</p>
                  <div className="mt-5 text-xs font-mono">0 requests · active</div>
                </div>
              ))
            )}
          </div>
        )}

      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* INTERACTIVE MODALS MATCHING SCREENSHOTS */}
      {/* ───────────────────────────────────────────────────────────── */}

      {/* MODAL 1: ADD MODEL ACCESS (BYO VS CREDITS) - SCREENSHOT 3 / 8 */}
      {showAddModelAccess && (
        <>
          <div className="v5-modal-overlay" onClick={() => setShowAddModelAccess(false)} />
          <div className="v5-modal-container">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>🔑</span> Add model access
                </h3>
                <p className="text-slate-500 text-[11px] mt-1">Credits for Smart Routing, or BYO key for direct billing</p>
              </div>
              <button 
                onClick={() => setShowAddModelAccess(false)}
                className="text-slate-400 hover:text-slate-900 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Option 1: Credits (Coming soon) */}
              <div className="border border-slate-100 bg-slate-50/50 p-4.5 rounded-xl relative">
                <span className="absolute top-3.5 right-3.5 v5-badge v5-badge-neutral text-[8px] font-bold">Coming Soon</span>
                <h4 className="font-bold text-slate-700 text-xs mb-1.5 flex items-center gap-1.5">
                  Prepaid Credits
                </h4>
                <p className="text-xs text-slate-500 mb-3.5 leading-normal">
                  Use one prepaid balance to run agents across supported models with Smart Routing and per-run cost tracking.
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-bold text-slate-500">
                  <div className="flex items-center gap-1">
                    <span className="text-blue-500 font-bold">✓</span> Fast setup
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-500 font-bold">✓</span> Smart Routing
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-500 font-bold">✓</span> One prepaid balance
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-500 font-bold">✓</span> Per-run cost tracking
                  </div>
                </div>
              </div>

              {/* Option 2: BYO Key */}
              <div className="border border-slate-200 bg-white p-4.5 rounded-xl hover:border-slate-300 transition-colors shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs mb-1.5 flex items-center gap-1.5">
                  BYO Provider Key
                </h4>
                <p className="text-xs text-slate-500 mb-3.5 leading-normal">
                  Bring your own OpenAI, Anthropic, Gemini, Azure, Bedrock, DeepSeek, or private model key for direct billing and contract ownership.
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-bold text-slate-500 mb-4.5">
                  <div className="flex items-center gap-1">
                    <span className="text-blue-500 font-bold">✓</span> Existing provider contracts
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-500 font-bold">✓</span> Direct provider billing
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-500 font-bold">✓</span> Private or custom models
                  </div>
                </div>
                
                <button
                  onClick={openSelectProviderModal}
                  className="v5-btn v5-btn-default w-full py-2.5 flex items-center justify-center gap-1.5 font-bold text-xs"
                >
                  ⚙️ Add Provider Key
                </button>
              </div>
            </div>

            <button 
              onClick={() => setShowAddModelAccess(false)}
              className="w-full mt-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {/* MODAL 2: SELECT PROVIDER (STEP 1 OF BYO KEY) - SCREENSHOT 7 */}
      {showSelectProvider && (
        <>
          <div className="v5-modal-overlay" onClick={() => setShowSelectProvider(false)} />
          <div className="v5-modal-container">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>🔑</span> Select Provider
                </h3>
                <p className="text-slate-500 text-[11px] mt-1">Connect your own provider key</p>
              </div>
              <button 
                onClick={() => setShowSelectProvider(false)}
                className="text-slate-400 hover:text-slate-900 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Stepper progress */}
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4 text-[10px] font-bold">
              <span className="text-white bg-[#0047ff] px-2.5 py-0.5 rounded-full">1</span>
              <span className="text-[#0047ff] uppercase">Select Provider</span>
              <span className="text-slate-200">——</span>
              <span className="text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">2</span>
              <span className="text-slate-400 uppercase">Configure Key</span>
            </div>

            <p className="text-[11px] text-slate-500 mb-4 font-semibold">Select a provider. Your API key is stored encrypted and never logged.</p>

            {/* Grid of vendors */}
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {providersList.map((prov) => (
                <button
                  key={prov.name}
                  type="button"
                  onClick={() => {
                    setSelectedProvider(prov.name)
                    openConfigureKeyModal()
                  }}
                  className={`p-3 border rounded-xl text-center hover:bg-slate-50 hover:border-slate-300 transition-all text-xs font-bold flex flex-col items-center gap-1.5 ${selectedProvider === prov.name ? 'border-[#0047ff] bg-blue-50/10 text-[#0047ff] ring-1 ring-[#0047ff]' : 'border-[#eaeaea] bg-white text-slate-700'}`}
                >
                  <span className="text-lg">{prov.icon}</span>
                  <span>{prov.name}</span>
                </button>
              ))}
            </div>

            {/* Custom option */}
            <div 
              onClick={() => {
                setSelectedProvider('Custom Provider')
                openConfigureKeyModal()
              }}
              className="border border-[#eaeaea] rounded-xl p-3.5 bg-slate-50/50 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-xs font-semibold mb-6 transition-all"
            >
              <div className="flex items-center gap-2 text-left">
                <span className="text-lg">🔌</span>
                <div>
                  <div className="text-slate-900 font-bold">Custom Provider</div>
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">Any HTTP endpoint (self-hosted, vLLM, Ollama, LiteLLM, or custom...)</div>
                </div>
              </div>
              <span className="text-slate-400 font-bold">→</span>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setShowSelectProvider(false)
                  setShowAddModelAccess(true)
                }}
                className="v5-btn v5-btn-default flex-1 font-bold py-2.5"
              >
                Back
              </button>
              <button 
                onClick={openConfigureKeyModal}
                className="v5-btn v5-btn-primary flex-1 font-bold py-2.5"
              >
                Continue
              </button>
            </div>
            <div className="text-center text-[10px] text-slate-400 mt-4">
              No provider key? AgentPay Credits coming soon
            </div>
          </div>
        </>
      )}

      {/* MODAL 3: CONFIGURE KEY (STEP 2 OF BYO KEY) - SCREENSHOT 6 */}
      {showConfigureKey && (
        <>
          <div className="v5-modal-overlay" onClick={() => setShowConfigureKey(false)} />
          <div className="v5-modal-container">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>🔌</span> Configure Key
                </h3>
                <p className="text-slate-500 text-[11px] mt-1">Configure your Custom Provider key</p>
              </div>
              <button 
                onClick={() => setShowConfigureKey(false)}
                className="text-slate-400 hover:text-slate-900 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Stepper progress */}
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4 text-[10px] font-bold">
              <span className="text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">✓</span>
              <span className="text-slate-400 uppercase">Select Provider</span>
              <span className="text-slate-200">——</span>
              <span className="text-white bg-[#0047ff] px-2.5 py-0.5 rounded-full">2</span>
              <span className="text-[#0047ff] uppercase">Configure Key</span>
            </div>

            <div className="bg-[#fafafa] border border-[#eaeaea] rounded-xl p-3.5 flex justify-between items-center text-xs mb-6">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔌</span>
                <div>
                  <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">PROVIDER</span>
                  <span className="font-bold text-slate-900">{selectedProvider}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowConfigureKey(false)
                  setShowSelectProvider(true)
                }}
                className="text-[#0047ff] font-bold text-xs hover:underline"
              >
                Change
              </button>
            </div>

            <form onSubmit={handleAddProviderKey} className="space-y-4">
              <div>
                <label className="v5-label block mb-1">PROVIDER NAME *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Internal vLLM"
                  value={providerName} 
                  onChange={(e) => setProviderName(e.target.value)}
                  className="v5-input" 
                />
              </div>

              <div>
                <label className="v5-label block mb-1">BASE URL *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="https://api.example.com/v1"
                  value={baseUrl} 
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="v5-input" 
                />
              </div>

              <div>
                <label className="v5-label block mb-1">KEY NAME</label>
                <input 
                  type="text" 
                  placeholder="e.g. My Custom Provider Key"
                  value={keyName} 
                  onChange={(e) => setKeyName(e.target.value)}
                  className="v5-input" 
                />
              </div>

              <div>
                <label className="v5-label block mb-1">CUSTOM PROVIDER API KEY *</label>
                <div className="relative">
                  <input 
                    type="password" 
                    required 
                    placeholder="Enter API key"
                    value={customApiKey} 
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className="v5-input pr-10" 
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 text-xs">👁</span>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="button"
                  onClick={() => alert('Validation simulation passed!')}
                  className="text-xs text-[#333] bg-white border border-slate-200 font-bold px-4 py-2.5 rounded-lg w-full hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  Validate API Key
                </button>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => {
                    setShowConfigureKey(false)
                    setShowSelectProvider(true)
                  }}
                  className="v5-btn v5-btn-default flex-1 font-bold"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  className="v5-btn v5-btn-primary flex-1 font-bold"
                >
                  ✓ Add Key
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* MODAL 4: CREATE AGENT (3-STEP AGENT REGISTRATION) - SCREENSHOT 4 */}
      {showCreateAgent && (
        <>
          <div className="v5-modal-overlay" onClick={() => setShowCreateAgent(false)} />
          <div className="v5-modal-container">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>⚡</span> Create Agent
                </h3>
                <p className="text-slate-500 text-[11px] mt-1">Define this agent's identity and type.</p>
              </div>
              <button 
                onClick={() => setShowCreateAgent(false)}
                className="text-slate-400 hover:text-slate-900 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Stepper progress */}
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4 text-[10px] font-bold">
              <span className="text-white bg-[#0047ff] px-2.5 py-0.5 rounded-full">1</span>
              <span className="text-[#0047ff] uppercase">Identity</span>
              <span className="text-slate-200">——</span>
              <span className="text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">2</span>
              <span className="text-slate-400 uppercase">Gateway Access</span>
              <span className="text-slate-200">——</span>
              <span className="text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">3</span>
              <span className="text-slate-400 uppercase">Connect</span>
            </div>

            <form onSubmit={handleCreateAgentSubmit} className="space-y-4">
              <div>
                <label className="v5-label block mb-2">Agent Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setAgentType('AI Agent')}
                    className={`border p-4.5 rounded-xl flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-all ${agentType === 'AI Agent' ? 'border-[#0047ff] bg-blue-50/5 ring-1 ring-[#0047ff]' : 'border-[#eaeaea] bg-white'}`}
                  >
                    <input 
                      type="radio" 
                      name="agentType" 
                      checked={agentType === 'AI Agent'}
                      onChange={() => setAgentType('AI Agent')}
                      className="accent-[#0047ff] mt-0.5 cursor-pointer" 
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">AI Agent</div>
                      <div className="text-[10px] text-slate-500 font-semibold mt-1 leading-normal">Route LLM calls through a provider key with policy, cost, and run tracking.</div>
                    </div>
                  </div>
                  
                  <div 
                    onClick={() => setAgentType('Workflow Agent')}
                    className={`border p-4.5 rounded-xl flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-all ${agentType === 'Workflow Agent' ? 'border-[#0047ff] bg-blue-50/5 ring-1 ring-[#0047ff]' : 'border-[#eaeaea] bg-white'}`}
                  >
                    <input 
                      type="radio" 
                      name="agentType" 
                      checked={agentType === 'Workflow Agent'}
                      onChange={() => setAgentType('Workflow Agent')}
                      className="accent-[#0047ff] mt-0.5 cursor-pointer" 
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Workflow Agent</div>
                      <div className="text-[10px] text-slate-500 font-semibold mt-1 leading-normal">Connect an external runtime - n8n, webhook, or any HTTPS backend.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="v5-label block mb-1">Agent Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Support Bot"
                  value={agentName} 
                  onChange={(e) => setAgentName(e.target.value)}
                  className="v5-input" 
                />
              </div>

              <div>
                <label className="v5-label block mb-1">Agent ID</label>
                <input 
                  type="text" 
                  value={agentId} 
                  onChange={(e) => setAgentId(e.target.value)}
                  className="v5-input font-mono bg-slate-50 text-slate-500 border border-slate-200" 
                />
              </div>

              <div>
                <label className="v5-label block mb-1">Description *</label>
                <textarea 
                  required 
                  placeholder="Handles customer support questions and routes escalations."
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  className="v5-textarea"
                  rows={2}
                />
              </div>

              <div>
                <label className="v5-label block mb-2">Environment *</label>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 w-fit">
                  {['Production', 'Staging', 'Development'].map((env) => (
                    <button
                      key={env}
                      type="button"
                      onClick={() => setAgentEnvironment(env)}
                      className={`px-3.5 py-1 text-[10px] font-bold rounded-md transition-all ${agentEnvironment === env ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowCreateAgent(false)}
                  className="v5-btn v5-btn-default flex-1 font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="v5-btn v5-btn-primary flex-1 font-bold"
                >
                  Next →
                </button>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  )
}
